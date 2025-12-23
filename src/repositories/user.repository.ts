import { PoolConnection } from "mysql2/promise";
import { db } from "../db/db";
import { QueryExecutor } from "../core/QueryExecutor";
import { UserDTO } from "../dtos/auth.dto";

/**
 * Repositorio para operaciones de base de datos relacionadas con usuarios
 */
export class UserRepository {
  async getConnection(): Promise<PoolConnection> {
    return db.getConnection();
  }

  async findByEmail(
    email: string,
    conn?: PoolConnection
  ): Promise<UserDTO | null> {
    const result = await QueryExecutor.executeSelectOne<UserDTO>(
      "SELECT * FROM usuario u WHERE u.email = ?",
      [email],
      conn
    );

    return result;
  }
}
