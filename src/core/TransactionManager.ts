import { PoolConnection } from "mysql2/promise";
import { db } from "../db/db";
import logger from "../config/logger.config";
/**
 * Transaction Manager para manejar transacciones de base de datos de forma segura
 */
export class TransactionManager {
  /**
   * Ejecuta una operación dentro de una transacción
   * Si la operación falla, hace rollback automáticamente
   *
   * @param callback - Función que recibe la conexión y ejecuta operaciones
   * @returns El resultado de la operación
   */
  static async execute<T>(
    callback: (conn: PoolConnection) => Promise<T>
  ): Promise<T> {
    const conn = await db.getConnection();
    const startTime = Date.now();

    try {
      // Iniciar transacción
      await conn.beginTransaction();
      logger.dev("Transaction started");

      // Ejecutar operaciones
      const result = await callback(conn);

      // Commit si todo salió bien
      await conn.commit();
      const duration = Date.now() - startTime;
      logger.dev("Transaction committed", { duration: `${duration}ms` });

      return result;
    } catch (error) {
      // Rollback en caso de error
      await conn.rollback();
      const duration = Date.now() - startTime;

      logger.error("Transaction rolled back", {
        error: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
      });

      throw error;
    } finally {
      // Siempre liberar la conexión
      conn.release();
    }
  }

  /**
   * Ejecuta múltiples operaciones en paralelo dentro de una transacción
   *
   * @param callbacks - Array de funciones que reciben la conexión
   * @returns Array con los resultados de cada operación
   */
  static async executeParallel<T>(
    callbacks: Array<(conn: PoolConnection) => Promise<T>>
  ): Promise<T[]> {
    return this.execute(async (conn) => {
      return Promise.all(callbacks.map((callback) => callback(conn)));
    });
  }

  /**
   * Ejecuta operaciones en secuencia dentro de una transacción
   * Útil cuando las operaciones dependen una de otra
   *
   * @param callbacks - Array de funciones que reciben la conexión y el resultado anterior
   * @returns El resultado de la última operación
   */
  static async executeSequential<T>(
    callbacks: Array<(conn: PoolConnection, previousResult?: any) => Promise<T>>
  ): Promise<T> {
    return this.execute(async (conn) => {
      let result: any;

      for (const callback of callbacks) {
        result = await callback(conn, result);
      }

      return result;
    });
  }
}
