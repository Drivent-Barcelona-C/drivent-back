import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels, getHotelsWithRooms, resumeHotels } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getHotels)
  .get("/resume", resumeHotels)
  .get("/:hotelId", getHotelsWithRooms);

export { hotelsRouter };
