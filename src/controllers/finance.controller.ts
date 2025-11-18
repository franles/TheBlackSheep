import { NextFunction, Request, Response } from "express";
import DIContainer from "../core/DIContainer";
import { FinanceSummaryQueryDTO } from "../dtos/finance.dto";
import { ErrorFactory } from "../errors/errorFactory";
import { ResponseBuilder } from "../core/ResponseBuilder";
// Obtener servicio con dependencias inyectadas
const financeService = DIContainer.getFinanceService();

/**
 * Obtener resumen financiero
 */
export async function getFinanceSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { anio, mes, moneda } = req.query;

    if (!anio) {
      throw ErrorFactory.badRequest("Falta el año en los parámetros");
    }

    const query: FinanceSummaryQueryDTO = {
      mes: mes ? Number(mes) : undefined,
      anio: Number(anio),
      moneda: moneda && !isNaN(Number(moneda)) ? Number(moneda) : null,  //moneda: moneda ? Number(moneda) : null,
    };

    const summary = await financeService.getFinanceSummary(query);

    res.status(200).json(ResponseBuilder.success({ data: summary }));
  } catch (error) {
    next(error);
  }
}

/**
 * Crear tipo de cambio
 */
export async function createExchangeRate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { moneda, valor_base } = req.body;

    if (!moneda || !valor_base) {
      throw ErrorFactory.badRequest("Falta la moneda o el valor de la misma");
    }

    const exchangeRateId = await financeService.createExchangeRate(
      moneda,
      valor_base
    );

    res
      .status(201)
      .json(
        ResponseBuilder.created(
          { tipo_cambio_id: exchangeRateId },
          "Tipo de cambio creado exitosamente"
        )
      );
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar tipo de cambio
 */
export async function updateExchangeRate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { rid: rateId } = req.params;
    const { valor } = req.body;

    if (!rateId || !valor) {
      throw ErrorFactory.badRequest(
        "Falta el id o el valor del tipo de cambio"
      );
    }

    await financeService.updateExchangeRate(Number(rateId), valor);

    res
      .status(200)
      .json(
        ResponseBuilder.message("Tipo de cambio actualizado correctamente")
      );
  } catch (error) {
    next(error);
  }
}
