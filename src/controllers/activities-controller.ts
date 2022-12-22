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
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    } else {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}

export async function activitySubscribe(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { activityId } = req.body;
  try {
    const activity = await activityService.postActivities(userId, activityId);
    return res.status(httpStatus.OK).send(activity);
  } catch (error) {
    if (error.name === "cannotSubscribeActivity") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}
