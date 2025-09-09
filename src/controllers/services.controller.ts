import { NextFunction, Response, Request } from "express";
import ServicesService from "../services/services.service";

export async function getServices(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const services = await ServicesService.getServices();
    res.status(200).json({ servicios: services });
  } catch (error) {
    next(error);
  }
}
export async function createServiceForTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { valor, pagado_por, viaje_id, servicio_id, moneda } = req.body;
    await ServicesService.createServiceForTrip(
      viaje_id,
      servicio_id,
      valor,
      pagado_por,
      moneda
    );

    res.status(201).json({ message: "Servicio creado exitosamente" });
  } catch (error) {
    next(error);
  }
}

export async function updateServiceForTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { pagado_por, valor, moneda } = req.body;
    const { sid, tid } = req.params;

    await ServicesService.updateServiceForTrip(
      tid,
      Number(sid),
      valor,
      pagado_por,
      moneda
    );

    res.status(200).json({ message: "Servicio actualizado exitosamente" });
  } catch (error) {
    next(error);
  }
}

export async function deleteServiceForTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { sid, tid } = req.params;

    await ServicesService.deleteServiceForTrip(tid, Number(sid));

    res.status(200).json({ message: "Servicio eliminado exitosamente" });
  } catch (error) {
    next(error);
  }
}
