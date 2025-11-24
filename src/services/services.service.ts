import { IServiceRepository } from "../interfaces/service.repository.interface";
import {
  CreateServiceForTripDTO,
  UpdateServiceForTripDTO,
} from "../dtos/service.dto";
import { TransactionManager } from "../core/TransactionManager";
import logger from "../config/logger.config";

export class ServicesService {
  constructor(private serviceRepository: IServiceRepository) {}

  async getServices(): Promise<void> {
    logger.info("Fetching all services");
    return await this.serviceRepository.findAll();
  }

  async createServiceForTrip(data: CreateServiceForTripDTO): Promise<void> {
    logger.info("Creating service for trip", {
      tripId: data.viaje_id,
      serviceId: data.servicio_id,
    });

    await TransactionManager.execute(async (conn) => {
      await this.serviceRepository.createForTrip(
        data.viaje_id,
        data.servicio_id,
        data.valor,
        data.pagado_por,
        data.moneda,
        data.valor_tasa_cambio || null,
        conn
      );
    });

    logger.info("Service created for trip successfully", {
      tripId: data.viaje_id,
      serviceId: data.servicio_id,
    });
  }

  async updateServiceForTrip(
    tripId: string,
    serviceId: number,
    data: UpdateServiceForTripDTO
  ): Promise<void> {
    logger.info("Updating service for trip", { tripId, serviceId });

    await TransactionManager.execute(async (conn) => {
      await this.serviceRepository.updateForTrip(
        tripId,
        serviceId,
        data.valor!,
        data.pagado_por!,
        data.moneda!,
        data.valor_tasa_cambio || null,
        conn
      );
    });

    logger.info("Service updated for trip successfully", { tripId, serviceId });
  }

  async deleteServiceForTrip(tripId: string, serviceId: number): Promise<void> {
    logger.info("Deleting service for trip", { tripId, serviceId });

    await TransactionManager.execute(async (conn) => {
      await this.serviceRepository.deleteForTrip(tripId, serviceId, conn);
    });

    logger.info("Service deleted for trip successfully", { tripId, serviceId });
  }
}
