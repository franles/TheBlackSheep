import { PoolConnection } from "mysql2/promise";
import {
  CreateTripDTO,
  UpdateTripDTO,
  TripResponseDTO,
} from "../dtos/trip.dto";
import {
  IBaseRepository,
  StoredProcedureResultWithTotal,
} from "./repository.interface";

/**
 * Interfaz para el repositorio de viajes
 */
export interface ITripRepository extends IBaseRepository {
  /**
   * Obtener viajes con filtros y paginación
   */
  findAll(
    filter: string | number | null,
    limit: number,
    offset: number,
    month: number | null,
    year: number | null,
    conn?: PoolConnection
  ): Promise<StoredProcedureResultWithTotal<TripResponseDTO>>;

  /**
   * Obtener un viaje por ID
   */
  findById(id: string, conn?: PoolConnection): Promise<TripResponseDTO | null>;

  /**
   * Crear un nuevo viaje
   */
  create(
    data: Omit<CreateTripDTO, "servicios">,
    conn?: PoolConnection
  ): Promise<string>;

  /**
   * Actualizar un viaje
   */
  update(
    id: string,
    data: Omit<UpdateTripDTO, "servicios">,
    conn?: PoolConnection
  ): Promise<string>;

  /**
   * Eliminar un viaje
   */
  delete(id: string, conn?: PoolConnection): Promise<string>;
}
