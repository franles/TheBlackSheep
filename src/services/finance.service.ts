import { FinanceRepository } from "../repositories/finance.repository";
import {
  FinanceSummaryQueryDTO,
  FinanceSummaryResponseDTO,
} from "../dtos/finance.dto";
import { VALIDATION } from "../constants/validation";
import { ErrorFactory } from "../errors/errorFactory";
import { summaryResponse } from "../utils/utils";
import { TransactionManager } from "../core/TransactionManager";
import logger from "../config/logger.config";

/**
 * Servicio de finanzas con lógica de negocio
 */
export class FinanceService {
  constructor(private financeRepository: FinanceRepository) {}

  /**
   * Obtener resumen financiero
   */
  async getFinanceSummary(
    query: FinanceSummaryQueryDTO
  ): Promise<FinanceSummaryResponseDTO> {
    // Validaciones
    if (query.anio < VALIDATION.FINANCE.MIN_YEAR) {
      throw ErrorFactory.badRequest(
        `El año debe ser mayor o igual a ${VALIDATION.FINANCE.MIN_YEAR}`
      );
    }

    if (query.mes !== undefined && query.mes !== null) {
      if (
        query.mes < VALIDATION.FINANCE.MIN_MONTH ||
        query.mes > VALIDATION.FINANCE.MAX_MONTH
      ) {
        throw ErrorFactory.badRequest(
          `El mes debe ser un número entre ${VALIDATION.FINANCE.MIN_MONTH} y ${VALIDATION.FINANCE.MAX_MONTH}`
        );
      }
    }

    logger.info("Fetching finance summary", {
      year: query.anio,
      month: query.mes,
      currency: query.moneda,
    });

    const summary = await this.financeRepository.getFinanceSummary(
      query.mes ?? null,
      query.anio,
      query.moneda ?? null
    );
    console.log(summary);
    const data = summaryResponse(summary);

    return data;
  }

  /**
   * Crear tipo de cambio
   */
  async createExchangeRate(currency: number, amount: number): Promise<number> {
    // Validación de inputs
    if (!currency || currency <= 0) {
      throw ErrorFactory.badRequest("ID de moneda inválido");
    }

    if (!amount || amount <= 0) {
      throw ErrorFactory.badRequest("Valor de cambio inválido");
    }

    logger.info("Creating exchange rate", { currency, amount });

    const exchangeRateId = await TransactionManager.execute(async (conn) => {
      return await this.financeRepository.createExchangeRate(
        currency,
        amount,
        conn
      );
    });

    logger.info("Exchange rate created successfully", { exchangeRateId });
    return exchangeRateId;
  }

  /**
   * Actualizar tipo de cambio
   */
  async updateExchangeRate(id: number, amount: number): Promise<void> {
    // Validación de inputs
    if (!id || id <= 0) {
      throw ErrorFactory.badRequest("ID de tipo de cambio inválido");
    }

    if (!amount || amount <= 0) {
      throw ErrorFactory.badRequest("Valor de cambio inválido");
    }

    logger.info("Updating exchange rate", { id, amount });

    await TransactionManager.execute(async (conn) => {
      const affectedRows = await this.financeRepository.updateExchangeRate(
        id,
        amount,
        conn
      );

      if (affectedRows === 0) {
        throw ErrorFactory.notFound("Tipo de cambio no encontrado");
      }
    });

    logger.info("Exchange rate updated successfully", { id });
  }
}
