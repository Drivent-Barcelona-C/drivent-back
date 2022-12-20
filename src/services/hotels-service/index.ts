import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";

async function listHotels(userId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotListHotelsError();
  }
}

async function getHotels(userId: number) {
  await listHotels(userId);

  const hotels = await hotelRepository.findHotels();
  return hotels;
}

async function getHotelsWithRooms(userId: number, hotelId: number) {
  await listHotels(userId);
  const hotel = await hotelRepository.findRoomsByHotelId(hotelId);

  if (!hotel) {
    throw notFoundError();
  }
  return hotel;
}

async function getResumeHotels(userId: number) {
  await listHotels(userId);

  const hotels = await hotelRepository.findResume();
  const newHotel = [];
  for(let i = 0; i < hotels.length; i++) {
    let acumuladorRoom = 0;
    const types: (boolean | string)[] = [false, false, false];
    hotels[i].Rooms.map( room => {
      if(room.capacity === 1 ) {
        types[0] = "Single";
      }
      if(room.capacity === 2 ) {
        types[1] = "Double";
      }
      if(room.capacity >= 3 ) {
        types[2] = "Triple";
      }
      acumuladorRoom+= (room.capacity - room.Booking.length);});
    newHotel.push({ ...hotels[0], vacanies: acumuladorRoom, types: types });
  }
  
  return newHotel;
}

const hotelService = {
  getHotels,
  getHotelsWithRooms,
  getResumeHotels,
};

export default hotelService;
