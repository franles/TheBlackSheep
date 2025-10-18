import { NextFunction, Request, Response } from "express";
import TripService from "../services/trips.service";
import { PAGINATION } from "../constants/pagination";
import { parseOptionalInt, parseStringOrNumber, validateDate, validateDateRange } from "../utils/validation";
import { ErrorFactory } from "../errors/errorFactory";

export async function getTrips(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filter = parseStringOrNumber(req.query.filter);

    // ✅ Validación robusta de paginación
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

    const offset = (page - 1) * limit;

    // ✅ Validación de mes y año
    const monthParam = parseOptionalInt(req.query.month as string, 1, 12);
    const yearParam = parseOptionalInt(req.query.year as string, 2000, 2100);

    const { data, total } = await TripService.getTrips(
      filter,
      limit,
      offset,
      monthParam,
      yearParam
    );

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.status(200).json({
      viajes: data,
      pagination: {
        currentPage: Math.min(page, totalPages),
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tid: tripId } = req.params;
    const trip = await TripService.getTrip(tripId);
    res.status(200).json({ viaje: trip });
  } catch (error) {
    next(error);
  }
}

export async function createTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      apellido,
      valor_total,
      destino,
      servicios,
      fecha_ida,
      fecha_vuelta,
      moneda,
    } = req.body;

    // ✅ Validar y parsear fechas correctamente
    const parsedFechaIda = new Date(fecha_ida);
    const parsedFechaVuelta = new Date(fecha_vuelta);

    if (!validateDate(parsedFechaIda)) {
      throw ErrorFactory.badRequest("Fecha de ida inválida");
    }

    if (!validateDate(parsedFechaVuelta)) {
      throw ErrorFactory.badRequest("Fecha de vuelta inválida");
    }

    const dateValidation = validateDateRange(parsedFechaIda, parsedFechaVuelta);
    if (!dateValidation.valid) {
      throw ErrorFactory.badRequest(dateValidation.error || "Error en las fechas");
    }

    const trip = await TripService.createTrip(
      apellido,
      valor_total,
      destino,
      parsedFechaIda,
      parsedFechaVuelta,
      moneda,
      servicios
    );

    res.status(201).json({ message: "Viaje creado exitosamente", trip });
  } catch (error) {
    next(error);
  }
}

export async function updateTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { tid: tripId } = req.params;
    const {
      apellido,
      valor_total,
      destino,
      servicios,
      moneda,
      fecha_ida,
      fecha_vuelta,
    } = req.body;

    // ✅ Validar y parsear fechas correctamente
    let parsedFechaIda: Date | null = null;
    let parsedFechaVuelta: Date | null = null;

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
      const dateValidation = validateDateRange(parsedFechaIda, parsedFechaVuelta);
      if (!dateValidation.valid) {
        throw ErrorFactory.badRequest(dateValidation.error || "Error en las fechas");
      }
    }

    const trip = await TripService.updateTrip(
      tripId,
      apellido ?? null,
      valor_total ?? null,
      destino ?? null,
      parsedFechaIda,
      parsedFechaVuelta,
      moneda ?? null,
      servicios
    );

    res.status(200).json({ message: "Viaje actualizado exitosamente", trip });
  } catch (error) {
    next(error);
  }
}

export async function deleteTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { tid: tripId } = req.params;

    const trip = await TripService.deleteTrip(tripId);

    res.status(200).json({ message: "Viaje eliminado exitosamente", trip });
  } catch (error) {
    next(error);
  }
}
