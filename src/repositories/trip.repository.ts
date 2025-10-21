import { PoolConnection } from "mysql2/promise";
import { db } from "../db/db";
import { ITripRepository } from "../interfaces/trip.repository.interface";
import {
  CreateTripDTO,
  TripResponseDTO,
  UpdateTripDTO,
} from "../dtos/trip.dto";
import { QueryExecutor } from "../core/QueryExecutor";
import { StoredProcedureResultWithTotal } from "../interfaces/repository.interface";

/**
 * Repositorio para operaciones de base de datos relacionadas con viajes
 */
export class TripRepository implements ITripRepository {
  async getConnection(): Promise<PoolConnection> {
    return db.getConnection();
  }

  async findAll(
    filter: string | number | null,
    limit: number,
    offset: number,
    month: number | null,
    year: number | null,
    conn?: PoolConnection
  ): Promise<StoredProcedureResultWithTotal<TripResponseDTO>> {
    const results = await QueryExecutor.executeStoredProcedure<any>(
      "obtener_viajes",
      [filter, limit, offset, month, year],
      { expectResultSets: true },
      conn
    );
    console.log("resultado", results);

    // Stored procedure retorna múltiples result sets:
    // results[0] = array de viajes (primer SELECT)
    // results[1] = array con total (segundo SELECT con COUNT)
    // results[2] = OkPacket (metadata del SP - ignorar)

    // Extraer datos
    const data = Array.isArray(results[0]) ? results[0] : [];
    console.log("data", data);
    // Extraer total del segundo result set
    const totalRow =
      Array.isArray(results[1]) && results[1].length > 0 ? results[1][0] : null;
    const total = totalRow?.total || 0;

    // Log temporal para debugging (remover después)
    console.log("=== DEBUGGING RESULTS ===");
    console.log("Total result sets:", results?.length);
    console.log("Data count:", data.length);
    console.log("Total items:", total);
    console.log("First trip:", data[0]?.id);
    console.log("========================");

    return { data, total };
  }

  async findById(
    id: string,
    conn?: PoolConnection
  ): Promise<TripResponseDTO | null> {
    const result = await QueryExecutor.executeStoredProcedure<any>(
      "obtener_viaje",
      [id],
      { expectSingleRow: true, allowEmpty: true },
      conn
    );

    return result || null;
  }

  async create(
    data: Omit<CreateTripDTO, "servicios">,
    conn?: PoolConnection
  ): Promise<string> {
    const result = await QueryExecutor.executeStoredProcedure<any>(
      "insertar_viaje",
      [
        data.apellido,
        data.valor_total,
        data.destino,
        data.fecha_ida,
        data.fecha_vuelta,
        data.moneda,
      ],
      { expectSingleRow: true },
      conn
    );

    return result.id;
  }

  async update(
    id: string,
    data: Omit<UpdateTripDTO, "servicios">,
    conn?: PoolConnection
  ): Promise<string> {
    const result = await QueryExecutor.executeStoredProcedure<any>(
      "actualizar_viaje",
      [
        id,
        data.apellido ?? null,
        data.valor_total ?? null,
        data.destino ?? null,
        data.fecha_ida ?? null,
        data.fecha_vuelta ?? null,
        data.moneda ?? null,
      ],
      { expectSingleRow: true },
      conn
    );

    return result.id;
  }

  async delete(id: string, conn?: PoolConnection): Promise<string> {
    const result = await QueryExecutor.executeStoredProcedure<any>(
      "eliminar_viaje",
      [id],
      { expectSingleRow: true },
      conn
    );

    return result.id;
  }
}
