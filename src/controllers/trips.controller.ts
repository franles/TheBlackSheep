import { NextFunction, Request, Response } from "express";
import { PAGINATION } from "../constants/pagination";
import {
  parseOptionalInt,
  parseStringOrNumber,
  validateDate,
  validateDateRange,
} from "../utils/validation";
import { ErrorFactory } from "../errors/errorFactory";
import {
  CreateTripDTO,
  UpdateTripDTO,
  GetTripsQueryDTO,
} from "../dtos/trip.dto";
import { ResponseBuilder } from "../core/ResponseBuilder";
import { TripService } from "../services/trips.service";

export class TripsController {
  constructor(private tripService: TripService) { }
  getTrips = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filter = parseStringOrNumber(req.query.filter);

      const limit = Math.min(
        Math.max(
          parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT,
          PAGINATION.MIN_LIMIT
        ),
        PAGINATION.MAX_LIMIT
      );

      const page = Math.max(
        parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE,
        PAGINATION.MIN_PAGE
      );

      const month = parseOptionalInt(req.query.month as string, 1, 12);
      const year = parseOptionalInt(req.query.year as string, 2000, 2100);

      const query: GetTripsQueryDTO = {
        filter: filter ?? undefined,
        limit,
        page,
        month: month ?? undefined,
        year: year ?? undefined,
      };

      const result = await this.tripService.getTrips(query);

      res.status(200).json({
        success: true,
        message: "Viajes obtenidos exitosamente",
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  getTrip = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { tid: tripId } = req.params;
      const trip = await this.tripService.getTrip(tripId);

      res.status(200).json(
        ResponseBuilder.success({
          data: trip,
          message: "Viaje obtenido exitosamente",
        })
      );
    } catch (error) {
      next(error);
    }
  };

  createTrip = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        apellido,
        valor_total,
        destino,
        servicios,
        fecha_ida,
        fecha_vuelta,
        moneda,
        cotizacion, // Frontend envía cotizacion
      } = req.body;

      // Validar y parsear fechas
      const parsedFechaIda = new Date(fecha_ida);
      const parsedFechaVuelta = new Date(fecha_vuelta);

      if (!validateDate(parsedFechaIda)) {
        throw ErrorFactory.badRequest("Fecha de ida inválida");
      }

      if (!validateDate(parsedFechaVuelta)) {
        throw ErrorFactory.badRequest("Fecha de vuelta inválida");
      }

      const dateValidation = validateDateRange(
        parsedFechaIda,
        parsedFechaVuelta
      );
      if (!dateValidation.valid) {
        throw ErrorFactory.badRequest(
          dateValidation.error || "Error en las fechas"
        );
      }

      const tripData: CreateTripDTO = {
        apellido,
        valor_total,
        destino,
        fecha_ida: parsedFechaIda,
        fecha_vuelta: parsedFechaVuelta,
        moneda,
        cotizacion,
        servicios,
      };

      const result = await this.tripService.createTrip(tripData);

      res
        .status(201)
        .json(ResponseBuilder.created(result, "Viaje creado exitosamente"));
    } catch (error) {
      next(error);
    }
  };

  updateTrip = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { tid: tripId } = req.params;
      const {
        apellido,
        valor_total,
        destino,
        servicios,
        moneda,
        cotizacion,
        fecha_ida,
        fecha_vuelta,
      } = req.body;

      // Validar y parsear fechas si están presentes
      let parsedFechaIda: Date | undefined;
      let parsedFechaVuelta: Date | undefined;

      if (fecha_ida) {
        parsedFechaIda = new Date(fecha_ida);
        if (!validateDate(parsedFechaIda)) {
          throw ErrorFactory.badRequest("Fecha de ida inválida");
        }
      }

      if (fecha_vuelta) {
        parsedFechaVuelta = new Date(fecha_vuelta);
        if (!validateDate(parsedFechaVuelta)) {
          throw ErrorFactory.badRequest("Fecha de vuelta inválida");
        }
      }

      // Si ambas fechas están presentes, validar el rango
      if (parsedFechaIda && parsedFechaVuelta) {
        const dateValidation = validateDateRange(
          parsedFechaIda,
          parsedFechaVuelta
        );
        if (!dateValidation.valid) {
          throw ErrorFactory.badRequest(
            dateValidation.error || "Error en las fechas"
          );
        }
      }

      const tripData: UpdateTripDTO = {
        apellido,
        valor_total,
        destino,
        fecha_ida: parsedFechaIda,
        fecha_vuelta: parsedFechaVuelta,
        moneda,
        cotizacion,
        servicios,
      };

      const result = await this.tripService.updateTrip(tripId, tripData);

      res
        .status(200)
        .json(
          ResponseBuilder.updated(result, "Viaje actualizado exitosamente")
        );
    } catch (error) {
      next(error);
    }
  };

  deleteTrip = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { tid: tripId } = req.params;

      await this.tripService.deleteTrip(tripId);

      res
        .status(200)
        .json(ResponseBuilder.deleted("Viaje eliminado exitosamente"));
    } catch (error) {
      next(error);
    }
  };
}
