import { PagadoPorType } from '../constants/validation';

/**
 * DTO para crear un servicio para un viaje
 */
export interface CreateServiceForTripDTO {
  viaje_id: string;
  servicio_id: number;
  valor: number;
  pagado_por: PagadoPorType;
  moneda: number;
}

/**
 * DTO para actualizar un servicio de un viaje
 */
export interface UpdateServiceForTripDTO {
  valor?: number;
  pagado_por?: PagadoPorType;
  moneda?: number;
}

/**
 * DTO de respuesta para un servicio
 */
export interface ServiceResponseDTO {
  id: number;
  nombre: string;
  descripcion?: string;
}
