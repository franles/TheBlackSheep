import { PoolConnection } from "mysql2/promise";
import { db } from "../db/db";
import { IServiceRepository } from "../interfaces/service.repository.interface";
import { ServiceResponseDTO } from "../dtos/service.dto";
import { QueryExecutor } from "../core/QueryExecutor";
import { PagadoPorType } from "../constants/validation";

/**
 * Repositorio para operaciones de base de datos relacionadas con servicios
 */
export class ServiceRepository implements IServiceRepository {
  async getConnection(): Promise<PoolConnection> {
    return db.getConnection();
  }

  async findAll(conn?: PoolConnection): Promise<ServiceResponseDTO[]> {
    return await QueryExecutor.executeSelect<ServiceResponseDTO>(
      "SELECT * FROM servicio_tipo",
      [],
      conn
    );
  }

  async createForTrip(
    tripId: string,
    serviceId: number,
    amount: number,
    payFor: PagadoPorType,
    currency: number,
    rateChange: number | null,
    conn?: PoolConnection
  ): Promise<void> {
    await QueryExecutor.executeInsert(
      "INSERT INTO servicio (viaje_id, servicio_tipo_id, valor, pagado_por, moneda_id, cotizacion) VALUES (?, ?, ?, ?, ?, ?)",
      [tripId, serviceId, amount, payFor, currency, rateChange],
      conn
    );
  }

  async updateForTrip(
    tripId: string,
    serviceId: number,
    amount: number,
    payFor: PagadoPorType,
    currency: number,
    rateChange: number | null,
    conn?: PoolConnection
  ): Promise<void> {
    await QueryExecutor.executeUpdate(
      "UPDATE servicio SET valor = IFNULL(?, valor), pagado_por = IFNULL(?, pagado_por),moneda_id = IFNULL(?, moneda_id), cotizacion = IFNULL(?, cotizacion) WHERE viaje_id = ? AND servicio_tipo_id = ?;",
      [amount, payFor, currency, rateChange, tripId, serviceId],
      conn
    );
  }

  async deleteForTrip(
    tripId: string,
    serviceId: number,
    conn?: PoolConnection
  ): Promise<void> {
    await QueryExecutor.executeDelete(
      "DELETE FROM servicio WHERE servicio_tipo_id = ? AND viaje_id = ?",
      [serviceId, tripId],
      conn
    );
  }
}
