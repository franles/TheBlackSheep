import { db } from "../db/db";
import { AppError } from "../errors/customErrors";
import { ErrorFactory } from "../errors/errorFactory";
import { PoolConnection } from "mysql2/promise";

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
    rateChange: number | null,
    conn?: PoolConnection
  ): Promise<void> {
    const connection = conn || (await db.getConnection());
    const shouldManageConnection = !conn;

    try {
      await connection.query("CALL insertar_servicio_viaje(?, ?, ?, ?, ?, ?)", [
        tripId,
        serviceId,
        amount,
        payFor,
        currency,
        rateChange,
      ]);
      
      if (shouldManageConnection) {
        await connection.commit();
      }
    } catch (error) {
      if (shouldManageConnection) {
        await connection.rollback();
      }
      
      if (error instanceof AppError) {
        throw error;
      }

      throw ErrorFactory.internal("Error inesperado del sistema");
    } finally {
      if (shouldManageConnection) {
        connection.release();
      }
    }
  }

  static async updateServiceForTrip(
    tripId: string | number,
    serviceId: number,
    amount: number,
    payFor: string,
    currency: number,
    conn?: PoolConnection
  ): Promise<void> {
    const localConn = conn ?? (await db.getConnection());
    const shouldManageTransaction = !conn;

    try {
      if (shouldManageTransaction) {
        await localConn.beginTransaction();
      }
      
      await localConn.query(
        "CALL actualizar_servicio_viaje(?, ?, ?, ?, ?)",
        [tripId, serviceId, amount, payFor, currency]
      );
      
      if (shouldManageTransaction) {
        await localConn.commit();
      }
    } catch (error) {
      if (shouldManageTransaction) {
        await localConn.rollback();
      }
      
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error('Error updating service:', error);
      throw ErrorFactory.internal("Error al actualizar servicio"); // ✅ CORREGIDO: Re-lanzar error
    } finally {
      if (shouldManageTransaction) {
        localConn.release();
      }
    }
  }

  static async deleteServiceForTrip(tripId: string, serviceId: number): Promise<void> {
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
