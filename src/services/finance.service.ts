import { FinanceRepository } from "../repositories/finance.repository";
import {
  FinanceSummaryQueryDTO,
  FinanceSummaryResponseDTO,
} from "../dtos/finance.dto";
import { VALIDATION } from "../constants/validation";
import { ErrorFactory } from "../errors/errorFactory";
import { summaryResponse } from "../utils/utils";
import logger from "../config/logger.config";

export class FinanceService {
  constructor(private financeRepository: FinanceRepository) {}

  async getFinanceSummary(
    query: FinanceSummaryQueryDTO
  ): Promise<FinanceSummaryResponseDTO> {
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
}
