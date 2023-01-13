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
  }

  console.log({ event });

  let hotel = await prisma.hotel.findFirst();
  if(!hotel){
    async function createHotel(hotelName:string) {
      const hotel = await prisma.hotel.create({
        data: {
          name: hotelName,
          image: "https://media-cdn.tripadvisor.com/media/photo-s/19/84/9a/36/salinas-maceio-all-inclusive.jpg", 
        },
      });
      const randomCapacity = () => Math.floor(Math.random() * 3 + 1);
      for(let i = 0; i < 16; i++){
        await prisma.room.create({
          data: {
            name: `${i+101}`,
            hotelId: hotel.id,
            capacity: randomCapacity(),
          }
        });  
      }
    }
    createHotel("Barcelona Hotel");
    createHotel("Candy Hotel");
    createHotel("Driven Resort Hotel");
    createHotel("Math Hotel");
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
