import { prisma } from "@/config";
import faker from "@faker-js/faker";

export function createActivity() {
  return prisma.activity.create({
    data: {
      name: faker.name.findName(),
      startHour: faker.date.future(),
      endHour: faker.date.future(),
      location: "AUDITORIO_LATERAL",
      capacity: 1,
    },
  });
}

export function createActivityWithStart() {
  return prisma.activity.create({
    data: {
      name: faker.name.findName(),
      startHour: "2022-12-21T19:42:15.177Z",
      endHour: faker.date.future(),
      location: "AUDITORIO_LATERAL",
      capacity: 1,
    },
  });
}

export function createActivityBooking(userId: number, activityId: number) {
  return prisma.activityBooking.create({
    data: {
      userId,
      activityId,
    },
  });
}
