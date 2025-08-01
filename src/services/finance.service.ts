import { db } from "../db/db";
import { AppError } from "../errors/customErrors";
import { ErrorFactory } from "../errors/errorFactory";

class FinanceService {
  static async getFinanceSummary(
    month: number | null,
    year: number,
    currency: string | null
  ) {
    if (year < 2025) {
      throw ErrorFactory.badRequest("El año debe ser mayor a 2024");
    }

    if (month !== null && (month < 1 || month > 12)) {
      throw ErrorFactory.badRequest("El mes debe ser un número entre 1 y 12");
    }
    const conn = await db.getConnection();

    try {
      const [res]: any = await conn.query("CALL resumen_financiero(?, ?, ?)", [
        month,
        year,
        currency,
      ]);

      if (!res[0] || res[0].length === 0)
        throw ErrorFactory.notFound("No se encontraron resultados");

      return res[0];
    } catch (error) {
      await conn.rollback();

      if (error instanceof AppError) {
        throw error;
      }

      throw ErrorFactory.internal("Error inesperado del sistema");
    } finally {
      conn.release();
    }
  }
}

export default FinanceService;
