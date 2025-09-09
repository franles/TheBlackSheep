import { db } from "../db/db";
import { AppError } from "../errors/customErrors";
import { ErrorFactory } from "../errors/errorFactory";

class ServicesService {
  static async getServices() {
    const conn = await db.getConnection();
    try {
      const [res]: any = await conn.query("SELECT * FROM servicio_tipo");
      if (!res || res.length === 0)
        throw ErrorFactory.notFound("No se encontraron los servicios");

      return res;
    } catch (error) {
      await conn.rollback();
      if (error instanceof AppError) {
        throw error;
      }

      throw ErrorFactory.internal("Error inesperado del sistema");
    } finally {
      conn.release();
    }
  }

  static async createServiceForTrip(
    tripId: string,
    serviceId: number,
    amount: number,
    payFor: string,
    currency: number,
    conn?: any
  ) {
    const connection = conn || (await db.getConnection());

    try {
      await connection.query("CALL insertar_servicio_viaje(?, ?, ?, ?, ?)", [
        tripId,
        serviceId,
        amount,
        payFor,
        currency,
      ]);
      if (!conn) await connection.commit();
    } catch (error) {
      if (!conn) await connection.rollback();
      if (error instanceof AppError) {
        throw error;
      }

      throw ErrorFactory.internal("Error inesperado del sistema");
    } finally {
      if (!conn) connection.release();
    }
  }

  static async updateServiceForTrip(
    tripId: string | number,
    serviceId: number,
    amount: number,
    payFor: string,
    currency: number,
    conn?: any
  ) {
    const localConn = conn ?? (await db.getConnection());

    try {
      if (!conn) {
        await localConn.beginTransaction();
      }
      const [res]: any = await localConn.query(
        "CALL actualizar_servicio_viaje(?, ?, ?, ?, ?)",
        [tripId, serviceId, amount, payFor, currency]
      );
      if (!conn) {
        await localConn.commit();
      }
    } catch (error) {
      if (!conn) {
        await localConn.rollback();
      }
      if (error instanceof AppError) {
        throw error;
      }
      console.log(error);
    } finally {
      if (!conn) {
        localConn.release();
      }
    }
  }

  static async deleteServiceForTrip(tripId: string, serviceId: number) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [res]: any = await conn.query(
        "CALL eliminar_servicio_viaje(?, ?)",
        [tripId, serviceId]
      );

      if (res.affectedRows === 0)
        throw ErrorFactory.badRequest("No se pudo eliminar el servicio");

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      if (error instanceof AppError) {
        throw error;
      }

      throw ErrorFactory.internal("Error inesperado del sistema");
    } finally {
      conn.release();
    }
  }
}

export default ServicesService;
