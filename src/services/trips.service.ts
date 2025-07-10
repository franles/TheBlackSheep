import { db } from "../db/db";
import { GetTripsResponse, Trip } from "../types/types";

class TripService {
  static async getTrips(
    filter: string | number | null,
    limit: number,
    offset: number
  ): Promise<GetTripsResponse> {
    const conn = await db.getConnection();
    try {
      const [res]: any = await conn.query("CALL obtener_viajes(?, ?, ?)", [
        filter,
        limit,
        offset,
      ]);
      const data = res[0];
      const total = res[1]?.[0].total || 0;

      return { data, total };
    } catch (error) {
      await conn.rollback();
    } finally {
      conn.release();
    }
    return { data: [], total: 0 };
  }

  static async getTrip(id: string) {
    const conn = await db.getConnection();
    try {
      const [res]: any = await conn.query("CALL obtener_viaje(?)", [id]);
      return res[0][0];
    } catch (error) {
      await conn.rollback();
      console.log(error);
    } finally {
      conn.release();
    }
  }

  static async createTrip(
    surname: string,
    amount: number,
    destiny: Pick<Trip, "destino">
  ): Promise<Pick<Trip, "id">> {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();
      const [res]: any = await conn.query("CALL insertar_viaje (?, ?, ?)", [
        surname,
        amount,
        destiny,
      ]);
      await conn.commit();

      const id = res[0]?.[0]?.id;
      return id;
    } catch (error) {
      await conn.rollback();
      console.error(error);
    } finally {
      conn.release();
    }
    return { id: "" };
  }

  static async updateTrip(
    tripId: string,
    surname: string,
    amount: number,
    destiny: Pick<Trip, "destino">
  ): Promise<Pick<Trip, "id">> {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [res]: any = await conn.query("CALL actualizar_viaje(?, ?, ?, ?)", [
        tripId,
        surname,
        amount,
        destiny,
      ]);
      await conn.commit();

      const id = res[0]?.[0]?.id;

      return id;
    } catch (error) {
      await conn.rollback();
    } finally {
      conn.release();
    }
    return { id: "" };
  }

  static async deleteTrip(tripId: string): Promise<Pick<Trip, "id">> {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [res]: any = await conn.query("CALL eliminar_viaje(?)", [tripId]);
      await conn.commit();

      const id = res[0]?.[0]?.id;

      return id;
    } catch (error) {
      await conn.rollback();
    } finally {
      conn.release();
    }
    return { id: "" };
  }
}

export default TripService;
