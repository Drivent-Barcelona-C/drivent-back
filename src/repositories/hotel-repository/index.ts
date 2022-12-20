import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany({
  });
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    }
  });
}

async function findResume() {
  return prisma.hotel.findMany({
    include: {
      Rooms: { include: {
        Booking: true,
      },
      }
    }
  });
}

const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
  findResume
};

export default hotelRepository;
