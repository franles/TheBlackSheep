import { Router } from "express";
import {
  createTrip,
  deleteTrip,
  getTrip,
  getTrips,
  updateTrip,
} from "../controllers/trips.controller";

const router = Router();

router.get("/", getTrips);
router.get("/:tid", getTrip);
router.post("/", createTrip);
router.patch("/:tid", updateTrip);
router.delete("/:tid", deleteTrip);

export default router;
