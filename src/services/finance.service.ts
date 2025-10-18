import { db } from "../db/db";
import { AppError } from "../errors/customErrors";
import { ErrorFactory } from "../errors/errorFactory";
import { VALIDATION } from "../constants/validation";

class FinanceService {
  static async getFinanceSummary(
    month: number | null,
    year: number,
    currency: string | null
  ) {
    // ✅ Validaciones con constantes
    if (year < VALIDATION.FINANCE.MIN_YEAR) {
      throw ErrorFactory.badRequest(`El año debe ser mayor o igual a ${VALIDATION.FINANCE.MIN_YEAR}`);
    }

    if (month !== null && (month < VALIDATION.FINANCE.MIN_MONTH || month > VALIDATION.FINANCE.MAX_MONTH)) {
      throw ErrorFactory.badRequest(`El mes debe ser un número entre ${VALIDATION.FINANCE.MIN_MONTH} y ${VALIDATION.FINANCE.MAX_MONTH}`);
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

  static async createExchangeRate(
    currency: number,
    amount: number
  ): Promise<Number> {
    // ✅ Validación de inputs
    if (!currency || currency <= 0) {
      throw ErrorFactory.badRequest("ID de moneda inválido");
    }

    if (!amount || amount <= 0) {
      throw ErrorFactory.badRequest("Valor de cambio inválido");
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      
      const [res]: any = await conn.query(
        "INSERT INTO tipo_cambio(fecha, moneda_id, valor_base) VALUES(NOW(), ?, ?)",
        [currency, amount]
      );
      
      await conn.commit();
      return res.insertId;
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

  static async updateExchangeRate(id: number, amount: number): Promise<void> {
    // ✅ Validación de inputs
    if (!id || id <= 0) {
      throw ErrorFactory.badRequest("ID de tipo de cambio inválido");
    }

    if (!amount || amount <= 0) {
      throw ErrorFactory.badRequest("Valor de cambio inválido");
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      
      const [result]: any = await conn.query(
        "UPDATE tipo_cambio SET valor_base = ? WHERE id = ?",
        [amount, id]
      );

      if (result.affectedRows === 0) {
        throw ErrorFactory.notFound("Tipo de cambio no encontrado");
      }
      
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      console.error('Error updating exchange rate:', error);
      
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
