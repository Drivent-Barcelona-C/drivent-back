import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
const prisma = new PrismaClient();

async function createHotel(hotelName: string) {
  const hotel = await prisma.hotel.create({
    data: {
      name: hotelName,
      image: "https://media-cdn.tripadvisor.com/media/photo-s/19/84/9a/36/salinas-maceio-all-inclusive.jpg",
    },
  });
  const randomCapacity = () => Math.floor(Math.random() * 3 + 1);
  for (let i = 1; i <= 16; i++) {
    await prisma.room.create({
      data: {
        name: `${i + 100}`,
        hotelId: hotel.id,
        capacity: randomCapacity(),
      },
    });
  }
}

async function main() {
  let event = await prisma.event.findFirst();
  if (!event) {
    event = await prisma.event.create({
      data: {
        title: "Driven.t",
        logoImageUrl: "https://files.driveneducation.com.br/images/logo-rounded.png",
        backgroundImageUrl: "linear-gradient(to right, #FA4098, #FFD77F)",
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(21, "days").toDate(),
      },
    });

    if (event) {
      console.log("Evento criado");
    }
  }
  let ticketTypes = await prisma.ticketType.findMany();
  if (!ticketTypes) {
    await prisma.ticketType.create({
      data: {
        name: "Online",
        price: 100,
        isRemote: true,
        includesHotel: false,
      },
    });
    await prisma.ticketType.create({
      data: {
        name: "Presencial",
        price: 250,
        isRemote: false,
        includesHotel: false,
      },
    });
    await prisma.ticketType.create({
      data: {
        name: "Presencial",
        price: 600,
        isRemote: false,
        includesHotel: true,
      },
    });
    ticketTypes = await prisma.ticketType.findMany();
  }

  let activities = await prisma.activity.findMany();
  if (!activities) {
    await prisma.activity.create({
      data: {
        name: "LoL: montando o PC ideal",
        startHour: "2022-12-16 12:00:00",
        endHour: "2022-12-16 13:00:00",
        location: "AUDITORIO_PRINCIPAL",
        capacity: 100,
      },
    });
    await prisma.activity.create({
      data: {
        name: "One Piece ou Narutinho?",
        startHour: "2022-12-17 12:00:00",
        endHour: "2022-12-17 14:00:00",
        location: "SALA_DE_WORKSHOP",
        capacity: 15,
      },
    });
    await prisma.activity.create({
      data: {
        name: "Minecraft: montando o PC ideal",
        startHour: "2022-12-16 13:00:00",
        endHour: "2022-12-16 14:00:00",
        location: "AUDITORIO_PRINCIPAL",
        capacity: 100,
      },
    });
    await prisma.activity.create({
      data: {
        name: "Aníme ou animê?",
        startHour: "2022-12-17 15:00:00",
        endHour: "2022-12-17 16:00:00",
        location: "AUDITORIO_LATERAL",
        capacity: 50,
      },
    });
    await prisma.activity.create({
      data: {
        name: "Regras, cronograma e avisos",
        startHour: "2022-12-15 12:00:00",
        endHour: "2022-12-15 15:00:00",
        location: "AUDITORIO_PRINCIPAL",
        capacity: 100,
      },
    });
    activities = await prisma.activity.findMany();
  }

  const hotel = await prisma.hotel.findFirst();
  if (!hotel) {
    createHotel("Barcelona Hotel");
    createHotel("Candy Hotel");
    createHotel("Driven Resort Hotel");
    createHotel("Math Hotel");
  }
  console.log("Tudo Criado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
