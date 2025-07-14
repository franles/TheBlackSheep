import { NextFunction, Request, Response } from "express";
import TripService from "../services/trips.service";

export async function getTrips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filter = req.query.filter
      ? isNaN(Number(req.query.filter))
        ? String(req.query.filter)
        : Number(req.query.filter)
      : null;
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const { data, total } = await TripService.getTrips(filter, limit, offset);
    console.log(data);
    res.status(200).json({
      data,
      pagination: {
        currentPage: page,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const { tid } = req.params;
    const trip = await TripService.getTrip(tid);
    res.status(200).json(trip);
  } catch (error) {
    next(error);
  }
}

export async function createTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { apellido, valor_total, destino } = req.body;

    const trip = await TripService.createTrip(apellido, valor_total, destino);

    res.status(201).json({ message: "Viaje creado exitosamente", trip });
  } catch (error) {
    next(error);
  }
}

export async function updateTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { tid } = req.params;
    const { apellido, valor_total, destino } = req.body;

    const trip = await TripService.updateTrip(
      tid,
      apellido ?? null,
      valor_total ?? null,
      destino ?? null
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
) {
  try {
    const { tid } = req.params;

    const trip = await TripService.deleteTrip(tid);

    res.status(200).json({ message: "Viaje eliminado exitosamente", trip });
  } catch (error) {
    next(error);
  }
}
