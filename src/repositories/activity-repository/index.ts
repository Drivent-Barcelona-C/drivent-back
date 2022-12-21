import { prisma } from "@/config";

async function findActivities() {
  return prisma.activity.findMany({
    include: {
      ActivityBooking: true,
    },
  });
}

async function findActivity(activityId: number) {
  return prisma.activity.findFirst({
    where: {
      id: activityId,
    },
  });
}

async function findUserActivities(userId: number) {
  return prisma.activityBooking.findMany({
    where: {
      userId,
    },
    include: {
      Activity: true,
    },
  });
}

async function createActivityBooking(userId: number, activityId: number) {
  return prisma.activityBooking.create({
    data: {
      userId,
      activityId,
    },
    select: {
      id: true,
      userId: true,
      activityId: true,
    },
  });
}

async function findBookingsByActivityId(activityId: number) {
  return prisma.activityBooking.findMany({
    where: {
      activityId,
    },
  });
}

const activityRepository = {
  findActivities,
  findActivity,
  findUserActivities,
  createActivityBooking,
  findBookingsByActivityId,
};

export default activityRepository;
