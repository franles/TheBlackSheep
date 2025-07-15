import { Router } from "express";
import {
  createServiceForTrip,
  deleteServiceForTrip,
  getServices,
  updateServiceForTrip,
} from "../controllers/services.controller";

const router = Router();

router.get("/", getServices);
router.post("/", createServiceForTrip);
router.patch("/:sid/trip/:tid", updateServiceForTrip);
router.delete("/:sid/trip/:tid", deleteServiceForTrip);

export default router;
