import { Router } from "express";
import {
  createTrip,
  deleteTrip,
  getTrip,
  getTrips,
  updateTrip,
} from "../controllers/trips.controller";
import { validateRequest } from "../middlewares/validateRequest";
import {
  tripDeleteSchema,
  tripPatchSchema,
  tripPostSchema,
} from "../middlewares/schemas/trips";

const router = Router();

router.get("/", getTrips);
router.get("/:tid", getTrip);
router.post("/", tripPostSchema, validateRequest, createTrip);
router.patch("/:tid", tripPatchSchema, validateRequest, updateTrip);
router.delete("/:tid", tripDeleteSchema, validateRequest, deleteTrip);

export default router;
