import ticketService from "@/services/tickets-service";
import { notFoundError, unauthorizedError, cannotSubscribeInTwoActivitiesInTheSameTimeError } from "@/errors";
import activityRepository from "@/repositories/activity-repository";
import { Activity } from "@prisma/client";

type ListActivity = Omit<Activity, "createdAt" | "updatedAt">;

async function validateAccess(userId: number) {
  const userHasPayment = await ticketService.getTicketByUserId(userId);
  if (userHasPayment.status !== "PAID" || userHasPayment.TicketType.isRemote) {
    throw unauthorizedError();
  }

  return userHasPayment;
}

async function getActivities(userId: number) {
  await validateAccess(userId);
  const activities = await activityRepository.findActivities();
  if (!activities) {
    throw notFoundError();
  }

  interface EventHashTable {
    [date: string]: ListActivity[]
  }

  const hash: EventHashTable = {};

  activities.forEach(activity => {
    const temp = activity.startHour.toLocaleDateString();
    const listActivity = {
      id: activity.id,
      name: activity.name,
      startHour: activity.startHour,
      endHour: activity.endHour,
      location: activity.location,
      capacity: activity.capacity,
      activityBooking: activity.ActivityBooking.length
    };
    if (!hash[temp]) {
      hash[temp] = [];
      hash[temp].push(listActivity);
    } else {
      hash[temp].push(listActivity);
    }
  });

  return hash;
}

async function postActivities(userId: number, activityId: number) {
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
  if (dontHaveTime.length >= 1) {
    throw cannotSubscribeInTwoActivitiesInTheSameTimeError();
  }

  const newSubscribe = await activityRepository.createActivityBooking(userId, activityId);
  return newSubscribe;
}

const activityService = {
  getActivities,
  postActivities,
};

export default activityService;
