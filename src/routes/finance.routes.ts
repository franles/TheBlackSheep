import { Router } from "express";
import { getFinanceSummary } from "../controllers/finance.controller";

const router = Router();

router.get("/", getFinanceSummary);

export default router;
