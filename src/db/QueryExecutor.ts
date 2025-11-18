import { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
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
  allowEmpty?: boolean;  // Agregado para permitir resultados vacíos
}

/**
 * Resultado de stored procedure
 */
interface StoredProcedureResult<T = any> {
  data: T;
  metadata?: any;
}

/**
 * Utilidad para ejecutar queries de forma consistente
 * Elimina código repetitivo y maneja errores de forma uniforme
 */
export class QueryExecutor {
  /**
   * Ejecuta una query con manejo automático de conexión y errores
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
        success: true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("Query execution failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
        errorMessage,
      });

      if (error instanceof AppError) {
        throw error;
      }

      throw ErrorFactory.internal(errorMessage);
    } finally {
      conn.release();
    }
  }

  /**
   * Ejecuta un stored procedure y retorna el resultado tipado
   */
  static async executeStoredProcedure<T>(
    procedureName: string,
    params: any[],
    options: StoredProcedureOptions = {}
  ): Promise<T> {
    return this.executeQuery(async (conn) => {
      const placeholders = params.map(() => "?").join(",");
      const query = `CALL ${procedureName}(${placeholders})`;

      const startTime = Date.now();
      const [resultSets] = await conn.query<any>(query, params);
      const duration = Date.now() - startTime;

      logger.db(query, duration, {
        procedureName,
        paramsCount: params.length,
      });

      // Si espera una única fila
      if (options.expectSingleRow) {
        const row = resultSets[0]?.[0];
        if (!row && !options.allowEmpty) {
          throw ErrorFactory.notFound("No se encontraron resultados");
        }
        return row as T;
      }

      // Si espera múltiples filas
      if (options.expectMultipleRows) {
        return (resultSets[0] || []) as T;
      }

      // Si espera múltiples result sets
      if (options.expectResultSets) {
        //log temporal para debbugin
        logger.info("ResultSets structure:", {
          isArray: Array.isArray(resultSets),
          length: Array.isArray(resultSets) ? resultSets.length : 0,
          firstElementIsArray: Array.isArray(resultSets?.[0]),
          secondElementIsArray: Array.isArray(resultSets?.[1] ?? null),
        });

        return resultSets as T;
      }

      // Por defecto, retornar el primer result set
      return resultSets as T;
    }, `Error ejecutando ${procedureName}`);
  }

  /**
   * Ejecuta un INSERT y retorna el ID insertado
   */
  static async executeInsert(
    query: string,
    params: any[],
    conn?: PoolConnection
  ): Promise<number> {
    const execute = async (connection: PoolConnection) => {
      const startTime = Date.now();
      const [result] = await connection.query<ResultSetHeader>(query, params);
      const duration = Date.now() - startTime;

      logger.db(query, duration, {
        insertId: result.insertId,
        affectedRows: result.affectedRows,
      });

      return result.insertId;
    };

    if (conn) {
      return execute(conn);
    }

    return this.executeQuery(execute, "Error en INSERT");
  }

  /**
   * Ejecuta un UPDATE y retorna el número de filas afectadas
   */
  static async executeUpdate(
    query: string,
    params: any[],
    conn?: PoolConnection
  ): Promise<number> {
    const execute = async (connection: PoolConnection) => {
      const startTime = Date.now();
      const [result] = await connection.query<ResultSetHeader>(query, params);
      const duration = Date.now() - startTime;

      logger.db(query, duration, {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows,
      });

      return result.affectedRows;
    };

    if (conn) {
      return execute(conn);
    }

    return this.executeQuery(execute, "Error en UPDATE");
  }

  /**
   * Ejecuta un DELETE y retorna el número de filas eliminadas
   */
  static async executeDelete(
    query: string,
    params: any[],
    conn?: PoolConnection
  ): Promise<number> {
    const execute = async (connection: PoolConnection) => {
      const startTime = Date.now();
      const [result] = await connection.query<ResultSetHeader>(query, params);
      const duration = Date.now() - startTime;

      logger.db(query, duration, {
        affectedRows: result.affectedRows,
      });

      if (result.affectedRows === 0) {
        throw ErrorFactory.notFound("No se encontró el registro a eliminar");
      }

      return result.affectedRows;
    };

    if (conn) {
      return execute(conn);
    }

    return this.executeQuery(execute, "Error en DELETE");
  }

  /**
   * Ejecuta un SELECT y retorna los resultados tipados
   */
  static async executeSelect<T extends RowDataPacket>(
    query: string,
    params: any[] = [],
    conn?: PoolConnection
  ): Promise<T[]> {
    const execute = async (connection: PoolConnection) => {
      const startTime = Date.now();
      const [rows] = await connection.query<T[]>(query, params);
      const duration = Date.now() - startTime;

      logger.db(query, duration, {
        rowCount: rows.length,
      });

      return rows;
    };

    if (conn) {
      return execute(conn);
    }

    return this.executeQuery(execute, "Error en SELECT");
  }

  /**
   * Ejecuta batch insert para múltiples filas
   */
  static async executeBatchInsert(
    tableName: string,
    columns: string[],
    values: any[][],
    conn?: PoolConnection
  ): Promise<number> {
    if (values.length === 0) {
      return 0;
    }

    const columnsStr = columns.join(", ");
    const placeholders = values
      .map(() => `(${columns.map(() => "?").join(",")})`)
      .join(",");
    const flatValues = values.flat();

    const query = `INSERT INTO ${tableName} (${columnsStr}) VALUES ${placeholders}`;

    const execute = async (connection: PoolConnection) => {
      const startTime = Date.now();
      const [result] = await connection.query<ResultSetHeader>(
        query,
        flatValues
      );
      const duration = Date.now() - startTime;

      logger.db(`Batch INSERT into ${tableName}`, duration, {
        rowCount: values.length,
        affectedRows: result.affectedRows,
      });

      return result.affectedRows;
    };

    if (conn) {
      return execute(conn);
    }

    return this.executeQuery(execute, `Error en batch INSERT en ${tableName}`);
  }
}
