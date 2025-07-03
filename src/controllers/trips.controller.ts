import { Request, Response } from "express";
import TripService from "../services/trips.service";

export async function getTrips(req: Request, res: Response) {
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
    res.status(500).json({ message: error });
  }
}

export async function getTrip(req: Request, res: Response) {
  try {
    const { tid } = req.params;
    const trip = await TripService.getTrip(tid);
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el viaje" });
  }
}
