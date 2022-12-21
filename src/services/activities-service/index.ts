import ticketService from "@/services/tickets-service";
import { notFoundError, unauthorizedError, cannotSubscribeInTwoActivitiesInTheSameTimeError } from "@/errors";
import activityRepository from "@/repositories/activity-repository";

async function getActivities(userId: number) {
  const activities = await activityRepository.findActivities();
  if (!activities) {
    throw notFoundError();
  }

  return activities;
}

async function postActivities(userId: number, activityId: number) {
  const userHasPayment = await ticketService.getTicketByUserId(userId);
  if (userHasPayment.status !== "PAID") {
    throw unauthorizedError();
  }
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

  const newSubscribe = activityRepository.createActivityBooking(userId, activityId);
  return newSubscribe;
}

const activityService = {
  getActivities,
  postActivities,
};

export default activityService;
