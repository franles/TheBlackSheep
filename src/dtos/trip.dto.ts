import { PagadoPorType, DestinoType } from "../constants/validation";

/**
 * DTO para crear un nuevo viaje
 */
export interface CreateTripDTO {
  apellido: string;
  valor_total: number;
  destino: DestinoType;
  fecha_ida: Date;
  fecha_vuelta: Date;
  moneda: number;
  servicios: CreateServiceDTO[];
}

/**
 * DTO para actualizar un viaje existente
 */
export interface UpdateTripDTO {
  apellido?: string;
  valor_total?: number;
  destino?: DestinoType;
  fecha_ida?: Date;
  fecha_vuelta?: Date;
  moneda?: number;
  servicios?: UpdateServiceInTripDTO[];
}

/**
 * DTO para crear un servicio dentro de un viaje
 */
export interface CreateServiceDTO {
  id: number;
  valor: number;
  pagado_por: PagadoPorType;
  moneda: number;
}

/**
 * DTO para actualizar un servicio dentro de un viaje
 */
export interface UpdateServiceInTripDTO {
  id: number;
  valor: number;
  pagado_por: PagadoPorType;
  moneda: number;
}

/**
 * DTO de respuesta para viaje
 */
export interface TripResponseDTO {
  id: string;
  estado: "pendiente" | "finalizado";
  fecha_ida: Date;
  fecha_vuelta: Date;
  moneda: string;
  destino: DestinoType;
  apellido: string;
  valor_total: number;
  ganancia: number;
  costo: number;
  servicios: ServiceInTripDTO[];
}

/**
 * DTO para servicio dentro de un viaje en la respuesta
 */
export interface ServiceInTripDTO {
  id: number;
  valor: number;
  nombre: string;
  pagado_por: PagadoPorType;
}

/**
 * DTO para query de viajes
 */
export interface GetTripsQueryDTO {
  filter?: string | number;
  limit?: number;
  page?: number;
  month?: number;
  year?: number;
}

/**
 * DTO de respuesta paginada para viajes
 */
export interface PaginatedTripsResponseDTO {
  data: TripResponseDTO[];
  pagination: PaginationMetaDTO;
}

/**
 * DTO de metadata de paginación
 */
export interface PaginationMetaDTO {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
}
