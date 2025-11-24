import { ITripRepository } from "../interfaces/trip.repository.interface";
import { IServiceRepository } from "../interfaces/service.repository.interface";
import {
  CreateTripDTO,
  UpdateTripDTO,
  GetTripsQueryDTO,
  PaginatedTripsResponseDTO,
  TripResponseDTO,
} from "../dtos/trip.dto";
import { TransactionManager } from "../core/TransactionManager";
import { ResponseBuilder } from "../core/ResponseBuilder";
import { ErrorFactory } from "../errors/errorFactory";
import { VALIDATION } from "../constants/validation";
import {
  sanitizeString,
  validateDate,
  validateDateRange,
} from "../utils/validation";
import logger from "../config/logger.config";
export class TripService {
  constructor(
    private tripRepository: ITripRepository,
    private serviceRepository: IServiceRepository
  ) {}

  async getTrips(query: GetTripsQueryDTO): Promise<PaginatedTripsResponseDTO> {
    let filter = query.filter ?? null;
    if (filter !== null && typeof filter === "string") {
      filter = sanitizeString(filter, VALIDATION.DB.MAX_STRING_LENGTH);
    }

    const limit = query.limit ?? 10;
    const page = query.page ?? 1;
    const offset = (page - 1) * limit;

    if (limit < 1 || limit > VALIDATION.DB.MAX_STRING_LENGTH) {
      throw ErrorFactory.badRequest("Límite inválido");
    }

    if (offset < 0) {
      throw ErrorFactory.badRequest("Página inválida");
    }

    const month = query.month ?? null;
    const year = query.year ?? null;

    if (
      month !== null &&
      (month < VALIDATION.FINANCE.MIN_MONTH ||
        month > VALIDATION.FINANCE.MAX_MONTH)
    ) {
      throw ErrorFactory.badRequest("Mes inválido");
    }

    if (year !== null && year < 2000) {
      throw ErrorFactory.badRequest("Año inválido");
    }

    logger.info("Fetching trips", { filter, limit, offset, month, year });

    const { data, total } = await this.tripRepository.findAll(
      filter,
      limit,
      offset,
      month,
      year
    );

    const pagination = ResponseBuilder.buildPagination(page, total, limit);
    console.log(data);
    return {
      data,
      pagination,
    };
  }

  async getTrip(id: string): Promise<TripResponseDTO> {
    logger.info("Fetching trip", { tripId: id });

    const trip = await this.tripRepository.findById(id);

    if (!trip) {
      throw ErrorFactory.notFound("Viaje no encontrado");
    }

    return trip;
  }

  async createTrip(data: CreateTripDTO): Promise<{ id: string }> {
    this.validateTripDates(data.fecha_ida, data.fecha_vuelta);

    logger.info("Creating trip", {
      apellido: data.apellido,
      servicesCount: data.servicios.length,
    });

    const tripId = await TransactionManager.execute(async (conn) => {
      const id = await this.tripRepository.create(
        {
          apellido: data.apellido,
          valor_total: data.valor_total,
          destino: data.destino,
          fecha_ida: data.fecha_ida,
          fecha_vuelta: data.fecha_vuelta,
          moneda: data.moneda,
        },
        conn
      );

      for (const service of data.servicios) {
        await this.serviceRepository.createForTrip(
          id,
          service.id,
          service.valor,
          service.pagado_por,
          service.moneda,
          null,
          conn
        );
      }

      logger.info("Trip created successfully", { tripId: id });
      return id;
    });

    return { id: tripId };
  }

  async updateTrip(id: string, data: UpdateTripDTO): Promise<{ id: string }> {
    if (data.fecha_ida && data.fecha_vuelta) {
      this.validateTripDates(data.fecha_ida, data.fecha_vuelta);
    }

    logger.info("Updating trip", { tripId: id });

    const tripId = await TransactionManager.execute(async (conn) => {
      const updatedId = await this.tripRepository.update(
        id,
        {
          apellido: data.apellido,
          valor_total: data.valor_total,
          destino: data.destino,
          fecha_ida: data.fecha_ida,
          fecha_vuelta: data.fecha_vuelta,
          moneda: data.moneda,
        },
        conn
      );

      if (data.servicios && data.servicios.length > 0) {
        for (const service of data.servicios) {
          await this.serviceRepository.updateForTrip(
            updatedId,
            service.id,
            service.valor,
            service.pagado_por,
            service.moneda,
            service.valor_tasa_cambio,
            conn
          );
        }
      }

      logger.info("Trip updated successfully", { tripId: updatedId });
      return updatedId;
    });

    return { id: tripId };
  }

  async deleteTrip(id: string): Promise<{ id: string }> {
    logger.info("Deleting trip", { tripId: id });

    const deletedId = await TransactionManager.execute(async (conn) => {
      return await this.tripRepository.delete(id, conn);
    });

    logger.info("Trip deleted successfully", { tripId: deletedId });
    return { id: deletedId };
  }

  private validateTripDates(startDate: Date, endDate: Date): void {
    if (!validateDate(startDate)) {
      throw ErrorFactory.badRequest("Fecha de ida inválida");
    }

    if (!validateDate(endDate)) {
      throw ErrorFactory.badRequest("Fecha de vuelta inválida");
    }

    const validation = validateDateRange(startDate, endDate);
    if (!validation.valid) {
      throw ErrorFactory.badRequest(validation.error || "Error en las fechas");
    }
  }
}
