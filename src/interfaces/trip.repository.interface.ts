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

export interface ITripRepository extends IBaseRepository {
  findAll(
    filter: string | number | null,
    limit: number,
    offset: number,
    month: number | null,
    year: number | null,
    conn?: PoolConnection
  ): Promise<StoredProcedureResultWithTotal<TripResponseDTO>>;

  findById(id: string, conn?: PoolConnection): Promise<TripResponseDTO | null>;

  create(
    data: Omit<CreateTripDTO, "servicios">,
    conn?: PoolConnection
  ): Promise<string>;

  update(
    id: string,
    data: Omit<UpdateTripDTO, "servicios">,
    conn?: PoolConnection
  ): Promise<string>;

  delete(id: string, conn?: PoolConnection): Promise<string>;
}
