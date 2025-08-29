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
    conn?: any
  ) {
    try {
      await conn.query("CALL insertar_servicio_viaje(?, ?, ?, ?)", [
        tripId,
        serviceId,
        amount,
        payFor,
      ]);
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

  static async updateServiceForTrip(
    tripId: string,
    serviceId: number,
    amount: number,
    payFor: string,
    conn?: any
  ) {
    console.log("updateServiceForTrip", { tripId, serviceId, amount, payFor });

    try {
      const [res]: any = await conn.query(
        "CALL actualizar_servicio_viaje(?, ?, ?, ?)",
        [tripId, serviceId, amount, payFor]
      );
      console.log("Resultado SP", res);

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
