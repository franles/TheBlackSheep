import { NextFunction, Request, Response } from "express";
import FinanceService from "../services/finance.service";
import { summaryResponse } from "../utils/utils";
import { ErrorFactory } from "../errors/errorFactory";

export async function getFinanceSummary(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { anio, mes, moneda } = req.query;

    if (!anio) {
      throw ErrorFactory.badRequest("Faltan el año en los parametros");
    }

    const summary = await FinanceService.getFinanceSummary(
      Number(mes) || null,
      Number(anio),
      String(moneda) || null
    );

    const resSummary = summaryResponse(summary);
    res.status(200).json({ resumen_financiero: resSummary });
  } catch (error) {
    next(error);
  }
}
