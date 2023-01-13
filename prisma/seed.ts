import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
const prisma = new PrismaClient();

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

    if (event) { console.log('Evento criado'); }
  }

  let activities = await prisma.activity.findMany();
  if (!activities) {
    await prisma.activity.create({
      data: {
        name: "LoL: montando o PC ideal",
        startHour:"2022-12-16 12:00:00",
        endHour:"2022-12-16 13:00:00",
        location:"AUDITORIO_PRINCIPAL",
        capacity: 100
      },
    });
    await prisma.activity.create({
      data: {
        name: "One Piece ou Narutinho?",
        startHour:"2022-12-17 12:00:00",
        endHour:"2022-12-17 14:00:00",
        location:"SALA_DE_WORKSHOP",
        capacity: 15
      },
    });
    await prisma.activity.create({
      data: {
        name: "Minecraft: montando o PC ideal",
        startHour:"2022-12-16 13:00:00",
        endHour:"2022-12-16 14:00:00",
        location:"AUDITORIO_PRINCIPAL",
        capacity: 100
      },
    });
    await prisma.activity.create({
      data: {
        name: "Aníme ou animê?",
        startHour:"2022-12-17 15:00:00",
        endHour:"2022-12-17 16:00:00",
        location:"AUDITORIO_LATERAL",
        capacity: 50
      },
    });
    await prisma.activity.create({
      data: {
        name: "Regras, cronograma e avisos",
        startHour:"2022-12-15 12:00:00",
        endHour:"2022-12-15 15:00:00",
        location:"AUDITORIO_PRINCIPAL",
        capacity: 100
      },
    });
    activities = await prisma.activity.findMany();

    if (activities) { console.log('Atividades criadas'); }
  }

  let hotel = await prisma.hotel.findFirst();
  if(!hotel){
    hotel = await prisma.hotel.create({
      data: {
        name: "Hotel Barcelona",
        image: "https://media-cdn.tripadvisor.com/media/photo-s/19/84/9a/36/salinas-maceio-all-inclusive.jpg", 
      },
    });

    await prisma.room.create({
      data: {
        name: "101",
        hotelId: hotel.id,
        capacity: 2
      }
    });
    await prisma.room.create({
      data: {
        name: "102",
        hotelId: hotel.id,
        capacity: 2
      }
    });
    await prisma.room.create({
      data: {
        name: "103",
        hotelId: hotel.id,
        capacity: 3
      }
    });
    await prisma.room.create({
      data: {
        name: "104",
        hotelId: hotel.id,
        capacity: 1
      }
    });
    await prisma.room.create({
      data: {
        name: "105",
        hotelId: hotel.id,
        capacity: 2
      }
    });
    let rooms = await prisma.room.findMany({
      where: {
        hotelId: hotel.id
      }
    });

    if (hotel) { console.log('Hotel criado'); }
    if (rooms) { console.log('Quartos criados'); }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
