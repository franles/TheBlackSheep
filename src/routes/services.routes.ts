import { Router } from "express";
import {
  createServiceForTrip,
  deleteServiceForTrip,
  getServices,
  updateServiceForTrip,
} from "../controllers/services.controller";
import {
  servicesDeleteSchema,
  servicesPatchSchema,
  servicesPostSchema,
} from "../middlewares/schemas/services";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();

router.get("/", getServices);
router.post("/", servicesPostSchema, validateRequest, createServiceForTrip);
router.patch(
  "/:sid/trip/:tid",
  servicesPatchSchema,
  validateRequest,
  updateServiceForTrip
);
router.delete(
  "/:sid/trip/:tid",
  servicesDeleteSchema,
  validateRequest,
  deleteServiceForTrip
);

export default router;
