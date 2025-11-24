import { NextFunction, Request, Response } from "express";
import { FinanceSummaryQueryDTO } from "../dtos/finance.dto";
import { ErrorFactory } from "../errors/errorFactory";
import { ResponseBuilder } from "../core/ResponseBuilder";
import { FinanceService } from "../services/finance.service";

export class FinanceController {
  constructor(private financeService: FinanceService) {}

  getFinanceSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { anio, mes, moneda } = req.query;

      if (!anio) {
        throw ErrorFactory.badRequest("Falta el año en los parámetros");
      }

      const query: FinanceSummaryQueryDTO = {
        mes: mes ? Number(mes) : undefined,
        anio: Number(anio),
        moneda: moneda && !isNaN(Number(moneda)) ? Number(moneda) : null, //moneda: moneda ? Number(moneda) : null,
      };

      const summary = await this.financeService.getFinanceSummary(query);

      res.status(200).json(ResponseBuilder.success({ data: summary }));
    } catch (error) {
      next(error);
    }
  };
}
