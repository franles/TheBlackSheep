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
    // Execute SP
    const results = await QueryExecutor.executeStoredProcedure<any>(
      "obtener_viajes",
      [filter, limit, offset, month, year],
      { expectResultSets: true },
      conn
    );

    // console.log("Raw results from DB:", JSON.stringify(results, null, 2));

    try {
      // Default data extraction
      // The first element should be the data array
      const data: TripResponseDTO[] =
        Array.isArray(results) && Array.isArray(results[0]) ? results[0] : [];

      // Total count extraction
      let total = 0;
      if (Array.isArray(results)) {
        // Look for the array that contains the total count
        // Usually it's the second result get (index 1) or inside one of the arrays
        const totalResult = results.find(
          (r) =>
            Array.isArray(r) &&
            r.length > 0 &&
            r[0] &&
            typeof r[0] === "object" &&
            "total" in r[0] &&
            r !== data
        );

        if (totalResult) {
          total = totalResult[0].total;
        }
      }

      return { data, total };
    } catch (error) {
      console.error("Error parsing getTrips results:", error);
      console.error("Results structure:", JSON.stringify(results, null, 2));
      // Return empty valid structure instead of failing
      return { data: [], total: 0 };
    }
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
        data.valor_tasa_cambio ?? null,
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
        data.cotizacion ?? null,
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
