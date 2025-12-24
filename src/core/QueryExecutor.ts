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
  allowEmpty?: boolean;
}

/**
 * Query Executor para operaciones de base de datos reutilizables
 */
export class QueryExecutor {
  /**
   * Ejecuta una query con manejo de errores automático y gestión de conexiones
   */
  static async executeQuery<T>(
    queryFn: (conn: PoolConnection) => Promise<T>,
    errorMessage: string = "Error en la consulta",
    conn?: PoolConnection
  ): Promise<T> {
    const shouldReleaseConn = !conn;
    const connection = conn || (await db.getConnection());
    const startTime = Date.now();

    try {
      const result = await queryFn(connection);
      const duration = Date.now() - startTime;

      // El logging de éxito se delega a las funciones específicas si es necesario,
      // o se podría agregar un log genérico aquí si se desea.
      // Por ahora mantenemos el log genérico solo si no hubo error.
      // Sin embargo, para evitar ruido, asumimos que las funciones específicas loguean sus detalles.

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
      if (shouldReleaseConn) {
        connection.release();
      }
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
    return this.executeQuery(
      async (connection) => {
        // Construir query con parámetros
        const placeholders = params.map(() => "?").join(",");
        const query = `CALL ${procedureName}(${placeholders})`;

        logger.dev("Executing stored procedure", {
          procedure: procedureName,
          paramsCount: params.length,
        });

        const startTime = Date.now();
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
      },
      `Error ejecutando ${procedureName}`,
      conn
    );
  }

  /**
   * Ejecuta un INSERT y retorna el ID insertado
   */
  static async executeInsert(
    query: string,
    params: any[],
    conn?: PoolConnection
  ): Promise<number> {
    return this.executeQuery(
      async (connection) => {
        const startTime = Date.now();
        const [result] = await connection.query<ResultSetHeader>(query, params);
        const duration = Date.now() - startTime;

        logger.db(query, duration, {
          insertId: result.insertId,
        });

        return result.insertId;
      },
      "Error al insertar datos",
      conn
    );
  }

  /**
   * Ejecuta un UPDATE y retorna las filas afectadas
   */
  static async executeUpdate(
    query: string,
    params: any[],
    conn?: PoolConnection
  ): Promise<number> {
    return this.executeQuery(
      async (connection) => {
        const startTime = Date.now();
        const [result] = await connection.query<ResultSetHeader>(query, params);
        const duration = Date.now() - startTime;

        logger.db(query, duration, {
          affectedRows: result.affectedRows,
        });

        return result.affectedRows;
      },
      "Error al actualizar datos",
      conn
    );
  }

  /**
   * Ejecuta un DELETE y retorna las filas afectadas
   */
  static async executeDelete(
    query: string,
    params: any[],
    conn?: PoolConnection
  ): Promise<number> {
    return this.executeQuery(
      async (connection) => {
        const startTime = Date.now();
        const [result] = await connection.query<ResultSetHeader>(query, params);
        const duration = Date.now() - startTime;

        logger.db(query, duration, {
          affectedRows: result.affectedRows,
        });

        return result.affectedRows;
      },
      "Error al eliminar datos",
      conn
    );
  }

  /**
   * Ejecuta un SELECT y retorna las filas encontradas
   */
  static async executeSelect<T>(
    query: string,
    params: any[],
    conn?: PoolConnection
  ): Promise<T[]> {
    return this.executeQuery(
      async (connection) => {
        const startTime = Date.now();
        const [rows] = await connection.query<any>(query, params);
        const duration = Date.now() - startTime;

        logger.db(query, duration, {
          resultCount: rows.length,
        });

        return rows as T[];
      },
      "Error al consultar datos",
      conn
    );
  }

  /**
   * Ejecuta un SELECT y retorna una única fila
   */
  static async executeSelectOne<T>(
    query: string,
    params: any[],
    conn?: PoolConnection
  ): Promise<T | null> {
    const rows = await this.executeSelect<T>(query, params, conn);
    return rows[0] || null;
  }
}
