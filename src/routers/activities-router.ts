import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { filterActivities, bookActivity } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("", filterActivities)
  .post("/:activityId", bookActivity);

export { activitiesRouter };
