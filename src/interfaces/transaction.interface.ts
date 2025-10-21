import { PoolConnection } from "mysql2/promise";

/**
 * Interfaz para gestión de transacciones
 */
export interface ITransactionManager {
  /**
   * Ejecuta una función dentro de una transacción
   * Si la función lanza un error, hace rollback automáticamente
   * Si tiene éxito, hace commit
   */
  execute<T>(callback: (conn: PoolConnection) => Promise<T>): Promise<T>;

  /**
   * Ejecuta múltiples operaciones en una transacción
   */
  executeMultiple<T>(
    operations: Array<(conn: PoolConnection) => Promise<any>>
  ): Promise<T[]>;
}
