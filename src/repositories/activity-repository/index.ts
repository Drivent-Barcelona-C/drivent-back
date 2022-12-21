import { prisma } from "@/config";

async function findActivities() {
  return prisma.activity.findMany({
    orderBy: {
      startHour: "asc"
    },
    include: {
      ActivityBooking: true,
    }
  });
}

const activityRepository = {
  findActivities,
};

export default activityRepository;
