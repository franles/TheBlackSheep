import { NextFunction, Response, Request } from "express";
import {
  CreateServiceForTripDTO,
  UpdateServiceForTripDTO,
} from "../dtos/service.dto";
import { ResponseBuilder } from "../core/ResponseBuilder";
import { ServicesService } from "../services/services.service";

export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  getServices = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const services = await this.servicesService.getServices();

      res.status(200).json(ResponseBuilder.success({ data: services }));
    } catch (error) {
      next(error);
    }
  };

  createServiceForTrip = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { valor, pagado_por, viaje_id, servicio_id, moneda, cotizacion } =
        req.body;

      const serviceData: CreateServiceForTripDTO = {
        viaje_id,
        servicio_id,
        valor,
        pagado_por,
        moneda,
        cotizacion,
      };

      await this.servicesService.createServiceForTrip(serviceData);

      res
        .status(201)
        .json(ResponseBuilder.message("Servicio creado exitosamente"));
    } catch (error) {
      next(error);
    }
  };

  updateServiceForTrip = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { pagado_por, valor, moneda, cotizacion } = req.body;
      const { sid: serviceId, tid: tripId } = req.params;

      const serviceData: UpdateServiceForTripDTO = {
        valor,
        pagado_por,
        moneda,
        cotizacion,
      };

      await this.servicesService.updateServiceForTrip(
        tripId,
        Number(serviceId),
        serviceData
      );

      res
        .status(200)
        .json(ResponseBuilder.message("Servicio actualizado exitosamente"));
    } catch (error) {
      next(error);
    }
  };

  deleteServiceForTrip = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sid: serviceId, tid: tripId } = req.params;

      await this.servicesService.deleteServiceForTrip(
        tripId,
        Number(serviceId)
      );

      res
        .status(200)
        .json(ResponseBuilder.deleted("Servicio eliminado exitosamente"));
    } catch (error) {
      next(error);
    }
  };
}
