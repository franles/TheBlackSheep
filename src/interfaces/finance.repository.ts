import { PoolConnection } from "mysql2/promise";
import { FinanceSummaryItemDTO } from "../dtos/finance.dto";
import { IBaseRepository } from "./repository.interface";

export interface IFinanceRepository extends IBaseRepository {
  getFinanceSummary(
    month: number | null,
    year: number,
    currency: number | null,
    conn?: PoolConnection
  ): Promise<FinanceSummaryItemDTO[]>;
}
