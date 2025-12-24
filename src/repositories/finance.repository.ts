import { PoolConnection } from "mysql2/promise";
import { db } from "../db/db";
import { QueryExecutor } from "../core/QueryExecutor";
import { IFinanceRepository } from "../interfaces/finance.repository";
import { FinanceSummaryResponseDTO } from "../dtos/finance.dto";

export class FinanceRepository implements IFinanceRepository {
  async getConnection(): Promise<PoolConnection> {
    return db.getConnection();
  }

  async getFinanceSummary(
    month: number | null,
    year: number,
    currency: number | null,
    conn?: PoolConnection
  ): Promise<FinanceSummaryResponseDTO> {
    const results = await QueryExecutor.executeStoredProcedure<any>(
      "resumen_financiero",
      [month, year, currency],
      { expectMultipleRows: true },
      conn
    );

    return results as FinanceSummaryResponseDTO;
  }
}
