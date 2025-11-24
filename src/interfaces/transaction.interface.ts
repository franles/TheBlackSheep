import { PoolConnection } from "mysql2/promise";

export interface ITransactionManager {
  execute<T>(callback: (conn: PoolConnection) => Promise<T>): Promise<T>;

  executeMultiple<T>(
    operations: Array<(conn: PoolConnection) => Promise<any>>
  ): Promise<T[]>;
}
