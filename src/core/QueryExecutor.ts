import { PoolConnection, RowDataPacket } from "mysql2/promise";
import { db } from "../db/db";
import { AppError } from "../errors/customErrors";
import { ErrorFactory } from "../errors/errorFactory";
import logger from "../config/logger.config";
/**
 * Opciones para ejecutar stored procedures
 */
interface StoredProcedureOptions {
  expectSingleRow?: boolean;
  expectMultipleRows?: boolean;
  expectResultSets?: boolean;
  allowEmpty?: boolean;
}

/**
 * Query Executor para operaciones de base de datos reutilizables
 */
export class QueryExecutor {
  /**
   * Ejecuta una query con manejo de errores automático
   */
  static async executeQuery<T>(
    queryFn: (conn: PoolConnection) => Promise<T>,
    errorMessage: string = "Error en la consulta"
  ): Promise<T> {
    const conn = await db.getConnection();
    const startTime = Date.now();

    try {
      const result = await queryFn(conn);
      const duration = Date.now() - startTime;

      logger.db("Query executed", duration, {
        errorMessage,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof AppError) {
        logger.warn("Query error (AppError)", {
          errorMessage,
          error: error.message,
          duration: `${duration}ms`,
        });
        throw error;
      }

      logger.error("Query error (Unexpected)", {
        errorMessage,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
      });

      throw ErrorFactory.internal(errorMessage);
    } finally {
      conn.release();
    }
  }

  /**
   * Ejecuta un stored procedure con validaciones automáticas
   */
  static async executeStoredProcedure<T extends RowDataPacket>(
    procedureName: string,
    params: any[],
    options: StoredProcedureOptions = {},
    conn?: PoolConnection
  ): Promise<T | T[] | any[]> {
    const shouldReleaseConn = !conn;
    const connection = conn || (await db.getConnection());
    const startTime = Date.now();

    try {
      // Construir query con parámetros
      const placeholders = params.map(() => "?").join(",");
      const query = `CALL ${procedureName}(${placeholders})`;

      logger.dev("Executing stored procedure", {
        procedure: procedureName,
        paramsCount: params.length,
      });

      const [results] = await connection.query<T[][]>(query, params);
      const duration = Date.now() - startTime;

      logger.db(query, duration, {
        procedure: procedureName,
        resultCount: results[0]?.length || 0,
      });

      if (options.expectResultSets) {
        return results;
      }
      // Validar resultados según opciones
      if (options.expectSingleRow) {
        if (!results[0]?.[0] && !options.allowEmpty) {
          throw ErrorFactory.notFound("No se encontraron resultados");
        }
        return results[0]?.[0] as T;
      }
      if (options.expectMultipleRows) {
        return results[0] as T[];
      }
      // Por defecto retornar el primer result set
      return results[0] as T[];
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof AppError) {
        logger.warn("Stored procedure error (AppError)", {
          procedure: procedureName,
          error: error.message,
          duration: `${duration}ms`,
        });
        throw error;
      }

      logger.error("Stored procedure error (Unexpected)", {
        procedure: procedureName,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
      });

      throw ErrorFactory.internal(`Error ejecutando ${procedureName}`);
    } finally {
      if (shouldReleaseConn) {
        connection.release();
      }
    }
  }

  /**
   * Ejecuta un INSERT y retorna el ID insertado
   */
  static async executeInsert(
    query: string,
    params: any[],
    conn?: PoolConnection
  ): Promise<number> {
    const shouldReleaseConn = !conn;
    const connection = conn || (await db.getConnection());
    const startTime = Date.now();

    try {
      const [result] = await connection.query<any>(query, params);
      const duration = Date.now() - startTime;

      logger.db(query, duration, {
        insertId: result.insertId,
      });

      return result.insertId;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("Insert error", {
        query,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
      });

      throw ErrorFactory.internal("Error al insertar datos");
    } finally {
      if (shouldReleaseConn) {
        connection.release();
      }
    }
  }

  /**
   * Ejecuta un UPDATE y retorna las filas afectadas
   */
  static async executeUpdate(
    query: string,
    params: any[],
    conn?: PoolConnection
  ): Promise<number> {
    const shouldReleaseConn = !conn;
    const connection = conn || (await db.getConnection());
    const startTime = Date.now();

    try {
      const [result] = await connection.query<any>(query, params);
      const duration = Date.now() - startTime;

      logger.db(query, duration, {
        affectedRows: result.affectedRows,
      });

      return result.affectedRows;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("Update error", {
        query,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
      });

      throw ErrorFactory.internal("Error al actualizar datos");
    } finally {
      if (shouldReleaseConn) {
        connection.release();
      }
    }
  }

  /**
   * Ejecuta un DELETE y retorna las filas afectadas
   */
  static async executeDelete(
    query: string,
    params: any[],
    conn?: PoolConnection
  ): Promise<number> {
    const shouldReleaseConn = !conn;
    const connection = conn || (await db.getConnection());
    const startTime = Date.now();

    try {
      const [result] = await connection.query<any>(query, params);
      const duration = Date.now() - startTime;

      logger.db(query, duration, {
        affectedRows: result.affectedRows,
      });

      return result.affectedRows;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("Delete error", {
        query,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
      });

      throw ErrorFactory.internal("Error al eliminar datos");
    } finally {
      if (shouldReleaseConn) {
        connection.release();
      }
    }
  }
}
