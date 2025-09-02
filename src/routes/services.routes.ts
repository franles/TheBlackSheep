import { Router } from "express";
import {
  createServiceForTrip,
  deleteServiceForTrip,
  getServices,
  updateServiceForTrip,
} from "../controllers/services.controller";
import { servicesDeleteSchema } from "../middlewares/schemas/services";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();

router.get("/", getServices);
router.post("/", createServiceForTrip);
router.put("/:sid/trip/:tid", updateServiceForTrip);
router.delete(
  "/:sid/trip/:tid",
  servicesDeleteSchema,
  validateRequest,
  deleteServiceForTrip
);

export default router;
