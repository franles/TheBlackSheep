import { db } from "../db/db";
import { User } from "../types/types";

class UserService {
  static async getUser(email: string): Promise<User> {
    const conn = await db.getConnection();
    try {
      const [res]: any = await conn.query("CALL obtener_usuario(?)", [email]);
      return res[0][0];
    } catch (error) {
      await conn.rollback();
      console.error(error);
    } finally {
      conn.release;
    }
    return { id: 0, nombre: "", email: "" };
  }
}

export default UserService;
