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

export async function createExchangeRate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { moneda, valor_base } = req.body;

    if (!moneda || !valor_base) {
      throw ErrorFactory.badRequest("Falta la moneda o el valor de la misma");
    }
    const exchange_rate = await FinanceService.createExchangeRate(
      moneda,
      valor_base
    );

    res.status(200).json({
      message: "Tipo de cambio creado exitosamente",
      tipo_cambio_id: exchange_rate,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateExchangeRate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { rid } = req.params;
    const { valor } = req.body;

    if (!rid || !valor) {
      throw ErrorFactory.badRequest(
        "Falta el id o el valor del tipo de cambio"
      );
    }

    await FinanceService.updateExchangeRate(Number(rid), valor);

    res
      .status(200)
      .json({ message: "Tipo de cambio actualizado correctamente" });
  } catch (error) {
    next(error);
  }
}
