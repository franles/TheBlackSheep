import { IServiceRepository } from "../interfaces/service.repository.interface";
import {
  CreateServiceForTripDTO,
  UpdateServiceForTripDTO,
  ServiceResponseDTO,
} from "../dtos/service.dto";
import { TransactionManager } from "../core/TransactionManager";
import logger from "../config/logger.config";
/**
 * Servicio de servicios con lógica de negocio
 */
export class ServicesService {
  constructor(private serviceRepository: IServiceRepository) {}

  /**
   * Obtener todos los servicios disponibles
   */
  async getServices(): Promise<ServiceResponseDTO[]> {
    logger.info("Fetching all services");
    return await this.serviceRepository.findAll();
  }

  /**
   * Crear un servicio para un viaje
   */
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
        null,
        conn
      );
    });

    logger.info("Service created for trip successfully", {
      tripId: data.viaje_id,
      serviceId: data.servicio_id,
    });
  }

  /**
   * Actualizar un servicio de un viaje
   */
  async updateServiceForTrip(
    tripId: string,
    serviceId: number,
    data: UpdateServiceForTripDTO
  ): Promise<void> {
    logger.info("Updating service for trip", { tripId, serviceId });

    await TransactionManager.execute(async (conn) => {
      // Obtener valores actuales si no se proporcionan
      // En un caso real, podrías querer obtener el servicio actual primero
      await this.serviceRepository.updateForTrip(
        tripId,
        serviceId,
        data.valor!,
        data.pagado_por!,
        data.moneda!,
        conn
      );
    });

    logger.info("Service updated for trip successfully", { tripId, serviceId });
  }

  /**
   * Eliminar un servicio de un viaje
   */
  async deleteServiceForTrip(tripId: string, serviceId: number): Promise<void> {
    logger.info("Deleting service for trip", { tripId, serviceId });

    await TransactionManager.execute(async (conn) => {
      await this.serviceRepository.deleteForTrip(tripId, serviceId, conn);
    });

    logger.info("Service deleted for trip successfully", { tripId, serviceId });
  }
}
