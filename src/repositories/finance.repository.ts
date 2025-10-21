import { PoolConnection } from "mysql2/promise";
import { db } from "../db/db";
import { QueryExecutor } from "../core/QueryExecutor";

/**
 * Repositorio para operaciones de base de datos relacionadas con finanzas
 */
export class FinanceRepository {
  async getConnection(): Promise<PoolConnection> {
    return db.getConnection();
  }

  async getFinanceSummary(
    month: number | null,
    year: number,
    currency: number | null,
    conn?: PoolConnection
  ): Promise<any[]> {
    const results = await QueryExecutor.executeStoredProcedure<any>(
      "resumen_financiero",
      [month, year, currency],
      { expectMultipleRows: true },
      conn
    );

    return results as any[];
  }

  async createExchangeRate(
    currency: number,
    amount: number,
    conn?: PoolConnection
  ): Promise<number> {
    const insertId = await QueryExecutor.executeInsert(
      "INSERT INTO tipo_cambio(fecha, moneda_id, valor_base) VALUES(NOW(), ?, ?)",
      [currency, amount],
      conn
    );

    return insertId;
  }

  async updateExchangeRate(
    id: number,
    amount: number,
    conn?: PoolConnection
  ): Promise<number> {
    const affectedRows = await QueryExecutor.executeUpdate(
      "UPDATE tipo_cambio SET valor_base = ? WHERE id = ?",
      [amount, id],
      conn
    );

    return affectedRows;
  }
}
