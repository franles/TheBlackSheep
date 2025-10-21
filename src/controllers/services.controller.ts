import { NextFunction, Response, Request } from "express";
import DIContainer from "../core/DIContainer";
import { CreateServiceForTripDTO, UpdateServiceForTripDTO } from "../dtos/service.dto";
import { ResponseBuilder } from "../core/ResponseBuilder";

// Obtener servicio con dependencias inyectadas
const servicesService = DIContainer.getServicesService();

/**
 * Obtener todos los servicios disponibles
 */
export async function getServices(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const services = await servicesService.getServices();
    
    res.status(200).json(
      ResponseBuilder.success(services)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Crear un servicio para un viaje
 */
export async function createServiceForTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { valor, pagado_por, viaje_id, servicio_id, moneda } = req.body;

    const serviceData: CreateServiceForTripDTO = {
      viaje_id,
      servicio_id,
      valor,
      pagado_por,
      moneda,
    };

    await servicesService.createServiceForTrip(serviceData);

    res.status(201).json(
      ResponseBuilder.message("Servicio creado exitosamente")
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar un servicio de un viaje
 */
export async function updateServiceForTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { pagado_por, valor, moneda } = req.body;
    const { sid: serviceId, tid: tripId } = req.params;

    const serviceData: UpdateServiceForTripDTO = {
      valor,
      pagado_por,
      moneda,
    };

    await servicesService.updateServiceForTrip(
      tripId,
      Number(serviceId),
      serviceData
    );

    res.status(200).json(
      ResponseBuilder.message("Servicio actualizado exitosamente")
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar un servicio de un viaje
 */
export async function deleteServiceForTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { sid: serviceId, tid: tripId } = req.params;

    await servicesService.deleteServiceForTrip(tripId, Number(serviceId));

    res.status(200).json(
      ResponseBuilder.deleted("Servicio eliminado exitosamente")
    );
  } catch (error) {
    next(error);
  }
}
