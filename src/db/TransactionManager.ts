import { PoolConnection } from "mysql2/promise";
import { db } from "../db/db";
import { ITransactionManager } from "../interfaces/transaction.interface";
import logger from "../config/logger.config";
import { AppError } from "../errors/customErrors";
import { ErrorFactory } from "../errors/errorFactory";

/**
 * Gestor de transacciones de base de datos
 * Proporciona una forma consistente de manejar transacciones
 */
export class TransactionManager implements ITransactionManager {
  /**
   * Ejecuta una operación dentro de una transacción
   * Maneja automáticamente commit y rollback
   */
  async execute<T>(callback: (conn: PoolConnection) => Promise<T>): Promise<T> {
    const conn = await db.getConnection();
    const startTime = Date.now();

    try {
      await conn.beginTransaction();

      logger.dev("Transaction started", {
        connectionId: conn.threadId,
      });

      const result = await callback(conn);

      await conn.commit();

      const duration = Date.now() - startTime;
      logger.dev("Transaction committed successfully", {
        connectionId: conn.threadId,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      await conn.rollback();

      const duration = Date.now() - startTime;
      logger.error("Transaction rolled back", {
        connectionId: conn.threadId,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Re-lanzar el error para que sea manejado por el caller
      if (error instanceof AppError) {
        throw error;
      }

      throw ErrorFactory.internal("Error en la transacción de base de datos");
    } finally {
      conn.release();
    }
  }

  /**
   * Ejecuta múltiples operaciones en una única transacción
   * Todas deben tener éxito o todas fallan
   */
  async executeMultiple<T>(
    operations: Array<(conn: PoolConnection) => Promise<T>>
  ): Promise<T[]> {
    return this.execute(async (conn) => {
      const results: T[] = [];

      for (const operation of operations) {
        const result = await operation(conn);
        results.push(result);
      }

      return results;
    });
  }

  /**
   * Ejecuta una operación con reintentos en caso de deadlock
   */
  async executeWithRetry<T>(
    callback: (conn: PoolConnection) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.execute(callback);
      } catch (error) {
        lastError = error as Error;

        // Solo reintentar en caso de deadlock
        const isDeadlock =
          error instanceof Error &&
          (error.message.includes("Deadlock") ||
            (error as any).code === "ER_LOCK_DEADLOCK");

        if (!isDeadlock || attempt === maxRetries) {
          throw error;
        }

        logger.warn(
          `Deadlock detected, retrying transaction (attempt ${attempt}/${maxRetries})`,
          {
            attempt,
            maxRetries,
          }
        );

        // Esperar un tiempo aleatorio antes de reintentar (exponential backoff)
        const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw (
      lastError || ErrorFactory.internal("Transaction failed after retries")
    );
  }
}

// Instancia singleton del transaction manager
export const transactionManager = new TransactionManager();
