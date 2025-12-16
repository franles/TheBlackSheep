import { PoolConnection } from "mysql2/promise";
import { IBaseRepository } from "./repository.interface";
import { PagadoPorType } from "../constants/validation";
import { ServiceResponseDTO } from "../dtos/service.dto";

export interface IServiceRepository extends IBaseRepository {
  findAll(conn?: PoolConnection): Promise<ServiceResponseDTO[]>;

  createForTrip(
    tripId: string,
    serviceId: number,
    amount: number,
    payFor: PagadoPorType,
    currency: number,
    rateChange: number | null,
    conn?: PoolConnection
  ): Promise<void>;

  updateForTrip(
    tripId: string,
    serviceId: number,
    amount: number,
    payFor: PagadoPorType,
    currency: number,
    rateChange: number | null,
    conn?: PoolConnection
  ): Promise<void>;

  deleteForTrip(
    tripId: string,
    serviceId: number,
    conn?: PoolConnection
  ): Promise<void>;
}
