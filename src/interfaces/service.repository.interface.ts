import { PoolConnection } from "mysql2/promise";
import { IBaseRepository } from "./repository.interface";
import { PagadoPorType } from "../constants/validation";

export interface IServiceRepository extends IBaseRepository {
  findAll(conn?: PoolConnection): Promise<void>;

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
