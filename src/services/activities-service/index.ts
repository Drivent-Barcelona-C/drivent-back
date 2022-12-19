import { notFoundError } from "@/errors";
import activityRepository from "@/repositories/activity-repository";

async function getActivities(userId: number) {
  const activities = await activityRepository.findActivities();
  if (!activities) {
    throw notFoundError();
  }

  return activities;
}

const activityService = {
  getActivities,
};

export default activityService;
