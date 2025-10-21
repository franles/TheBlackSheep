import { PoolConnection } from 'mysql2/promise';
import { ServiceResponseDTO } from '../dtos/service.dto';
import { IBaseRepository } from './repository.interface';
import { PagadoPorType } from '../constants/validation';

/**
 * Interfaz para el repositorio de servicios
 */
export interface IServiceRepository extends IBaseRepository {
  /**
   * Obtener todos los servicios
   */
  findAll(conn?: PoolConnection): Promise<ServiceResponseDTO[]>;

  /**
   * Crear un servicio para un viaje
   */
  createForTrip(
    tripId: string,
    serviceId: number,
    amount: number,
    payFor: PagadoPorType,
    currency: number,
    rateChange: number | null,
    conn?: PoolConnection
  ): Promise<void>;

  /**
   * Actualizar un servicio de un viaje
   */
  updateForTrip(
    tripId: string,
    serviceId: number,
    amount: number,
    payFor: PagadoPorType,
    currency: number,
    conn?: PoolConnection
  ): Promise<void>;

  /**
   * Eliminar un servicio de un viaje
   */
  deleteForTrip(tripId: string, serviceId: number, conn?: PoolConnection): Promise<void>;
}
