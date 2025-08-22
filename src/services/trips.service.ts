import { db } from "../db/db";
import { AppError } from "../errors/customErrors";
import { ErrorFactory } from "../errors/errorFactory";
import { GetTripsResponse, Trip } from "../types/types";
import ServicesService from "./services.service";

class TripService {
  static async getTrips(
    filter: string | number | null,
    limit: number,
    offset: number,
    month: number | null,
    year: number | null
  ): Promise<GetTripsResponse> {
    const conn = await db.getConnection();
    try {
      const [res]: any = await conn.query(
        "CALL obtener_viajes(?, ?, ?, ?, ?)",
        [filter, limit, offset, month, year]
      );

      const data = res[0];
      const total = res[1]?.[0].total || 0;

      return { data, total };
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

  static async getTrip(id: string) {
    const conn = await db.getConnection();
    try {
      const [res]: any = await conn.query("CALL obtener_viaje(?)", [id]);

      if (!res[0][0] || res.length === 0)
        throw ErrorFactory.notFound("No se encontraron resultados");

      return res[0][0];
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

  static async createTrip(
    surname: string,
    amount: number,
    destiny: Pick<Trip, "destino">,
    services: {
      id: number;
      valor: number;
      pagado_por: "pendiente" | "pablo" | "soledad" | "mariana";
    }[]
  ): Promise<Pick<Trip, "id">> {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();
      const [res]: any = await conn.query("CALL insertar_viaje (?, ?, ?)", [
        surname,
        amount,
        destiny,
      ]);

      if (!res[0][0] || res.length === 0)
        throw ErrorFactory.notFound("No se encontraron resultados");

      const id = res[0]?.[0]?.id;

      for (const service of services) {
        await ServicesService.createServiceForTrip(
          id,
          service.id,
          service.valor,
          service.pagado_por,
          conn
        );
      }
      await conn.commit();
      return id;
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

  static async updateTrip(
    tripId: string,
    surname: string,
    amount: number,
    destiny: Pick<Trip, "destino">
  ): Promise<Pick<Trip, "id">> {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [res]: any = await conn.query("CALL actualizar_viaje(?, ?, ?, ?)", [
        tripId,
        surname,
        amount,
        destiny,
      ]);

      if (!res[0][0] || res.length === 0)
        throw ErrorFactory.notFound("No se encontraron resultados");

      const id = res[0]?.[0]?.id;
      await conn.commit();
      return id;
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

  static async deleteTrip(tripId: string): Promise<Pick<Trip, "id">> {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [res]: any = await conn.query("CALL eliminar_viaje(?)", [tripId]);

      if (!res[0][0] || res.length === 0)
        throw ErrorFactory.notFound("No se encontraron resultados");

      const id = res[0]?.[0]?.id;
      await conn.commit();

      return id;
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

export default TripService;
