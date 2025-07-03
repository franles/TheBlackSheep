import { Router } from "express";
import { getTrip, getTrips } from "../controllers/trips.controller";

const router = Router();

router.get("/", getTrips);
router.get("/:tid", getTrip);

export default router;
