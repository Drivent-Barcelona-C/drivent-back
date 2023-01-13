import { prisma } from "@/config";
import { Booking } from "@prisma/client";
import roomRepository from "@/repositories/room-repository";
import { cannotBookingError, notFoundError } from "@/errors";

type CreateParams = Omit<Booking, "id" | "createdAt" | "updatedAt">;
type UpdateParams = Omit<Booking, "createdAt" | "updatedAt">;

async function create({ roomId, userId }: CreateParams): Promise<Booking> {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
    }
  });
}

async function createWithTransaction({ roomId, userId }: CreateParams): Promise<Booking> {
  let booking;
  const room = await roomRepository.findById(roomId);
  if (!room) {
    throw notFoundError();
  }

  prisma.$transaction(
    async (prisma) => {
      const bookings = await prisma.booking.findMany({
        where: {
          roomId,
        },
        include: {
          Room: true,
        }
      });
      
      if (room.capacity <= bookings.length) {
        throw cannotBookingError();
      }
      booking = prisma.booking.create({
        data: {
          roomId,
          userId,
        }
      });
    });
  return booking;
}

async function findByRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId,
    },
    include: {
      Room: true,
    }
  });
}

async function findByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true,
    }
  });
}

async function upsertBooking({ id, roomId, userId }: UpdateParams) {
  return prisma.booking.upsert({
    where: {
      id,
    },
    create: {
      roomId,
      userId,
    },
    update: {
      roomId,
    }
  });
}

const bookingRepository = {
  create,
  findByRoomId,
  findByUserId,
  upsertBooking,
  createWithTransaction,
};

export default bookingRepository;
