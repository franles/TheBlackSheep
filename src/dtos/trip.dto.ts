import { PagadoPorType, DestinoType } from "../constants/validation";

export interface CreateTripDTO {
  apellido: string;
  fecha: Date;
  valor_total: number;
  destino: DestinoType;
  fecha_ida: Date;
  fecha_vuelta: Date;
  moneda: number;
  cotizacion?: number | null;
  valor_total_usd?: number;
  servicios: CreateServiceDTO[];
}

export interface UpdateTripDTO {
  apellido?: string;
  valor_total?: number;
  fecha?: Date;
  destino?: DestinoType;
  fecha_ida?: Date;
  fecha_vuelta?: Date;
  moneda?: number;
  cotizacion?: number | null;
  valor_total_usd?: number;
  servicios?: UpdateServiceInTripDTO[];
}

export interface CreateServiceDTO {
  id: number;
  valor: number;
  pagado_por: PagadoPorType;
  moneda: number;
  observacion?: string | null;
  cotizacion?: number | null;
}

export interface UpdateServiceInTripDTO {
  id: number;
  valor: number;
  pagado_por: PagadoPorType;
  moneda: number;
  cotizacion: number | null;
  observacion: string | null;
}

export interface TripResponseDTO {
  id: string;
  estado: "pendiente" | "finalizado";
  fecha: Date;
  fecha_ida: Date;
  fecha_vuelta: Date;
  moneda: string;
  destino: DestinoType;
  apellido: string;
  valor_total: number;
  valor_total_usd: number;
  ganancia: number;
  ganancia_usd: number;
  costo: number;
  costo_usd: number;
  servicios: ServiceInTripDTO[];
  cotizacion: number;
}

export interface ServiceInTripDTO {
  id: number;
  valor: number;
  nombre: string;
  pagado_por: PagadoPorType;
  cotizacion: number;
  moneda: string;
}

export interface GetTripsQueryDTO {
  filter?: string | number;
  limit?: number;
  page?: number;
  month?: number;
  year?: number;
}

export interface PaginatedTripsResponseDTO {
  data: TripResponseDTO[];
  pagination: PaginationMetaDTO;
}

export interface PaginationMetaDTO {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
}
