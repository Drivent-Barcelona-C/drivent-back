import { notFoundError } from "@/errors";
import activityRepository from "@/repositories/activity-repository";
import { Activity } from "@prisma/client";

async function getActivities(userId: number) {
  const activities = await activityRepository.findActivities();
  if (!activities) {
    throw notFoundError();
  }

  interface EventHashTable {
    [date: string]: Activity[]
  }

  const hash: EventHashTable = {};

  activities.forEach(activity => {
    const temp = activity.startHour.toLocaleDateString();
    if (!hash[temp]) {
      hash[temp] = [];
      hash[temp].push(activity);
    } else {
      hash[temp].push(activity);
    }
  });

  return hash;
}

const activityService = {
  getActivities,
};

export default activityService;
