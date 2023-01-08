import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { filterActivities, activitySubscribe } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("", filterActivities)
  .post("", activitySubscribe);

export { activitiesRouter };
