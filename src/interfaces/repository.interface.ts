import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

/**
 * Interfaz base para todos los repositorios
 */
export interface IBaseRepository {
  getConnection(): Promise<PoolConnection>;
}

/**
 * Resultado de stored procedure con datos y total
 */
export interface StoredProcedureResultWithTotal<T> {
  data: T[];
  total: number;
}

/**
 * Tipos de resultado de MySQL
 */
export type QueryResult<T> = [T[], ResultSetHeader];
export type StoredProcedureResult = RowDataPacket[][];
