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
      conn,
    );
  }

  async createForTrip(
    tripId: string,
    serviceId: number,
    amount: number,
    payFor: PagadoPorType,
    currency: number,
    rateChange: number | null,
    observation: string | null,
    conn?: PoolConnection,
  ): Promise<void> {
    await QueryExecutor.executeInsert(
      "INSERT IGNORE INTO servicio (viaje_id, servicio_tipo_id, valor, pagado_por, moneda_id, cotizacion, observacion) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [tripId, serviceId, amount, payFor, currency, rateChange, observation],
      conn,
    );
  }

  async updateForTrip(
    tripId: string,
    serviceId: number,
    amount: number,
    payFor: PagadoPorType,
    currency: number,
    rateChange: number | null,
    observation: string | null,
    conn?: PoolConnection,
  ): Promise<void> {
    await QueryExecutor.executeUpdate(
      "UPDATE servicio SET valor = IFNULL(?, valor), pagado_por = IFNULL(?, pagado_por),moneda_id = IFNULL(?, moneda_id), cotizacion = IFNULL(?, cotizacion), observacion = IFNULL(?, observacion) WHERE viaje_id = ? AND servicio_tipo_id = ?;",
      [amount, payFor, currency, rateChange, observation, tripId, serviceId],
      conn,
    );
  }

  async deleteForTrip(
    tripId: string,
    serviceId: number,
    conn?: PoolConnection,
  ): Promise<void> {
    await QueryExecutor.executeDelete(
      "DELETE FROM servicio WHERE servicio_tipo_id = ? AND viaje_id = ?",
      [serviceId, tripId],
      conn,
    );
  }

  /**
   * Recalcula la cotización de todos los servicios de un viaje cuya moneda
   * difiere de la moneda del viaje, usando la nueva cotización del viaje.
   *
   * Lógica:
   * - Si el viaje pasa a ARS (monedaId=1): los servicios en USD reciben la nueva cotización.
   *   Los servicios en ARS quedan con cotización NULL.
   * - Si el viaje pasa a USD o Mixto (monedaId=2 ó 3): los servicios en USD mantienen
   *   la nueva cotización del viaje. Los servicios en ARS reciben la nueva cotización
   *   para poder convertirse a USD.
   */
  async recotizarServiciosViaje(
    tripId: string,
    nuevaCotizacion: number | null,
    nuevaMonedaId: number,
    conn?: PoolConnection,
  ): Promise<void> {
    if (nuevaMonedaId === 1) {
      // Viaje ARS: servicios USD reciben la cotización (si hay), servicios ARS quedan sin cotización
      if (nuevaCotizacion != null && nuevaCotizacion > 0) {
        await QueryExecutor.executeUpdate(
          `UPDATE servicio SET cotizacion = ? WHERE viaje_id = ? AND moneda_id = 2`,
          [nuevaCotizacion, tripId],
          conn,
        );
      }
      await QueryExecutor.executeUpdate(
        `UPDATE servicio SET cotizacion = NULL WHERE viaje_id = ? AND moneda_id = 1`,
        [tripId],
        conn,
      );
    } else if (nuevaMonedaId === 2) {
      // Viaje USD: servicios ARS reciben la cotización para convertir, servicios USD sin cotización
      if (nuevaCotizacion != null && nuevaCotizacion > 0) {
        await QueryExecutor.executeUpdate(
          `UPDATE servicio SET cotizacion = ? WHERE viaje_id = ? AND moneda_id = 1`,
          [nuevaCotizacion, tripId],
          conn,
        );
      }
      await QueryExecutor.executeUpdate(
        `UPDATE servicio SET cotizacion = NULL WHERE viaje_id = ? AND moneda_id = 2`,
        [tripId],
        conn,
      );
    } else if (nuevaMonedaId === 3) {
      // Viaje Mixto: todos los servicios reciben la cotización del viaje
      if (nuevaCotizacion != null && nuevaCotizacion > 0) {
        await QueryExecutor.executeUpdate(
          `UPDATE servicio SET cotizacion = ? WHERE viaje_id = ?`,
          [nuevaCotizacion, tripId],
          conn,
        );
      }
    }
  }
}
