import { db } from "../db/db";
import { AppError } from "../errors/customErrors";
import { ErrorFactory } from "../errors/errorFactory";
import { GetTripsResponse, Trip } from "../types/types";
import ServicesService from "./services.service";
import { VALIDATION } from "../constants/validation";
import { sanitizeString } from "../utils/validation";

class TripService {
  static async getTrips(
    filter: string | number | null,
    limit: number,
    offset: number,
    month: number | null,
    year: number | null
  ): Promise<GetTripsResponse> {
    // ✅ Validación y sanitización de inputs
    if (filter !== null && typeof filter === 'string') {
      filter = sanitizeString(filter, VALIDATION.DB.MAX_STRING_LENGTH);
    }

    if (limit < 1 || limit > VALIDATION.DB.MAX_STRING_LENGTH) {
      throw ErrorFactory.badRequest("Límite inválido");
    }

    if (offset < 0) {
      throw ErrorFactory.badRequest("Offset inválido");
    }

    if (month !== null && (month < VALIDATION.FINANCE.MIN_MONTH || month > VALIDATION.FINANCE.MAX_MONTH)) {
      throw ErrorFactory.badRequest("Mes inválido");
    }

    if (year !== null && year < 2000) {
      throw ErrorFactory.badRequest("Año inválido");
    }

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

  static async getTrip(id: string): Promise<Trip> {
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
    destiny: string,
    departureDate: Date,
    returnDate: Date,
    currency: number,
    services: {
      id: number;
      valor: number;
      pagado_por: "pendiente" | "pablo" | "soledad" | "mariana";
      moneda: number;
    }[]
  ): Promise<Pick<Trip, "id">> {
    // ✅ Validar servicios antes de comenzar
    if (!services || services.length === 0) {
      throw ErrorFactory.badRequest('Debe proporcionar al menos un servicio');
    }

    services.forEach((service, index) => {
      if (!service.id || !service.valor || !service.moneda) {
        throw ErrorFactory.badRequest(`El servicio en posición ${index + 1} está incompleto`);
      }
      if (service.valor <= 0) {
        throw ErrorFactory.badRequest(`El valor del servicio debe ser mayor a 0`);
      }
    });

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();
      const [res]: any = await conn.query(
        "CALL insertar_viaje (?, ?, ?, ?, ?, ?)",
        [surname, amount, destiny, departureDate, returnDate, currency]
      );

      if (!res[0][0] || res.length === 0)
        throw ErrorFactory.notFound("No se encontraron resultados");

      const id = res[0]?.[0]?.id;
      for (const service of services) {
        await ServicesService.createServiceForTrip(
          id,
          service.id,
          service.valor,
          service.pagado_por,
          service.moneda,
          null,
          conn
        );
      }
      await conn.commit();

      return id;
    } catch (error) {
      await conn.rollback();
      console.error('Error creating trip:', error);
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
    surname: string | null,
    amount: number | null,
    destiny: string | null,
    departureDate: Date | null,
    returnDate: Date | null,
    currency: number | null,
    services: {
      id: number;
      valor: number;
      pagado_por: "pendiente" | "pablo" | "soledad" | "mariana";
      moneda: number;
    }[]
  ): Promise<Pick<Trip, "id">> {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [res]: any = await conn.query(
        "CALL actualizar_viaje(?, ?, ?, ?, ?, ?, ?)",
        [tripId, surname, amount, destiny, departureDate, returnDate, currency]
      );

      if (!res[0][0] || res.length === 0)
        throw ErrorFactory.notFound("No se encontraron resultados");

      const id = res[0]?.[0]?.id;

      if (services && services.length > 0) {
        for (const service of services) {
          await ServicesService.updateServiceForTrip(
            id,
            service.id,
            service.valor,
            service.pagado_por,
            service.moneda,
            conn
          );
        }
      }
      await conn.commit();
      return id;
    } catch (error) {
      await conn.rollback();
      console.error('Error updating trip:', error);

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
