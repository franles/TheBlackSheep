import { Router } from "express";
import {
  createExchangeRate,
  getFinanceSummary,
  updateExchangeRate,
} from "../controllers/finance.controller";

const router = Router();

router.get("/", getFinanceSummary);
router.post("/rate", createExchangeRate);
router.patch("/rate/:rid", updateExchangeRate);

export default router;
