import { db } from "../db/db";
import { AppError } from "../errors/customErrors";
import { ErrorFactory } from "../errors/errorFactory";
import { User } from "../types/types";

class UserService {
  static async getUser(email: string): Promise<User> {
    const conn = await db.getConnection();
    try {
      const [res]: any = await conn.query("CALL obtener_usuario(?)", [email]);

      if (res[0][0] || res.length === 0)
        throw ErrorFactory.notFound("No se encontraron resultados");

      return res[0][0];
    } catch (error) {
      await conn.rollback();
      if (error instanceof AppError) {
        throw error;
      }

      throw ErrorFactory.internal("Error inesperado del sistema");
    } finally {
      conn.release;
    }
  }
}

export default UserService;
