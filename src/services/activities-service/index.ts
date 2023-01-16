import ticketService from "@/services/tickets-service";
import { notFoundError, unauthorizedError, cannotSubscribeInTwoActivitiesInTheSameTimeError } from "@/errors";
import activityRepository from "@/repositories/activity-repository";
import { Activity } from "@prisma/client";
import { cacheConnection } from "@/config";

export type ActivityInfo = Omit<Activity, "createdAt" | "updatedAt">;

const redisClient = cacheConnection();

async function validateAccess(userId: number) {
  const userHasPayment = await ticketService.getTicketByUserId(userId);
  if (userHasPayment.status === "RESERVED" || userHasPayment.TicketType.isRemote) {
    throw unauthorizedError();
  }

  return userHasPayment;
}

async function getActivities(userId: number) {
  await validateAccess(userId);

  const cachedActivities = await (await redisClient).get("cachedActivitiesHash");
  if (cachedActivities) {
    return JSON.parse(cachedActivities);
  }

  const activities = await activityRepository.findActivities();
  if (!activities) {
    throw notFoundError();
  }

  interface EventHashTable {
    [date: string]: ActivityInfo[];
  }

  const hash: EventHashTable = {};

  activities.forEach((activity) => {
    const temp = activity.startHour.toLocaleDateString("en-US");
    const activityInfo = {
      id: activity.id,
      name: activity.name,
      startHour: activity.startHour,
      endHour: activity.endHour,
      location: activity.location,
      capacity: activity.capacity,
      activityBookings: activity.ActivityBooking.length,
      isUserEnrolled: activity.ActivityBooking.some((data) => data.userId === userId),
    };

    if (!hash[temp]) {
      hash[temp] = [];
      hash[temp].push(activityInfo);
    } else {
      hash[temp].push(activityInfo);
    }
  });

  (await redisClient).set("cachedActivitiesHash", JSON.stringify(hash));
  return hash;
}

async function postActivities(userId: number, activityId: number) {
  const sameTimeActivitiesLimit = 1;
  const userHasPayment = await validateAccess(userId);
  const activityExists = await activityRepository.findActivity(activityId);
  if (!activityExists) {
    throw notFoundError();
  }
  const activityBookings = await activityRepository.findBookingsByActivityId(activityId);
  if (!userHasPayment.TicketType.isRemote && activityBookings.length >= activityExists.capacity) {
    throw unauthorizedError();
  }
  const haveFreeTime = await activityRepository.findUserActivities(userId);
  const dontHaveTime = haveFreeTime.filter(
    (activity) =>
      activity.id !== activityExists.id &&
      activity.Activity.startHour.getDay() === activityExists.startHour.getDay() &&
      activity.Activity.startHour.getHours() === activityExists.startHour.getHours(),
  );
  if (dontHaveTime.length >= sameTimeActivitiesLimit) {
    throw cannotSubscribeInTwoActivitiesInTheSameTimeError();
  }

  const newSubscribe = await activityRepository.createActivityBooking(userId, activityId);
  (await redisClient).del("cachedActivitiesHash");
  return newSubscribe;
}

const activityService = {
  getActivities,
  postActivities,
};

export default activityService;
