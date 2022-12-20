import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import activityService from "@/services/activities-service";

export async function filterActivities(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const activities = await activityService.getActivities(userId);
    return res.status(httpStatus.OK).send(activities);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function bookActivity(req: AuthenticatedRequest, res: Response) {
  // try {
  //   const { userId } = req;

  //   const { roomId } = req.body;

  //   if (!roomId) {
  //     return res.sendStatus(httpStatus.BAD_REQUEST);
  //   }

  //   const booking = await bookingService.bookingRoomById(userId, Number(roomId));

  //   return res.status(httpStatus.OK).send({
  //     bookingId: booking.id,
  //   });
  // } catch (error) {
  //   if (error.name === "CannotBookingError") {
  //     return res.sendStatus(httpStatus.FORBIDDEN);
  //   }
  //   return res.sendStatus(httpStatus.NOT_FOUND);
  // }
}
