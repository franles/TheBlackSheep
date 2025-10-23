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
    const shouldReleaseConn = !conn;
    const connection = conn || (await db.getConnection());

    try {
      const [rows] = await connection.query<any[]>(
        "SELECT * FROM servicio_tipo"
      );
      return rows;
    } finally {
      if (shouldReleaseConn) {
        connection.release();
      }
    }
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
    await QueryExecutor.executeStoredProcedure(
      "insertar_servicio_viaje",
      [tripId, serviceId, amount, payFor, currency, rateChange],
      {},
      conn
    );
  }

  async updateForTrip(
    tripId: string,
    serviceId: number,
    amount: number,
    payFor: PagadoPorType,
    currency: number,
    conn?: PoolConnection
  ): Promise<void> {
    await QueryExecutor.executeStoredProcedure(
      "actualizar_servicio_viaje",
      [tripId, serviceId, amount, payFor, currency],
      {},
      conn
    );
  }

  async deleteForTrip(
    tripId: string,
    serviceId: number,
    conn?: PoolConnection
  ): Promise<void> {
    await QueryExecutor.executeStoredProcedure(
      "eliminar_servicio_viaje",
      [tripId, serviceId],
      {},
      conn
    );
  }
}
