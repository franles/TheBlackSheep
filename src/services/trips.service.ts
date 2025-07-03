import { db } from "../db/db";
import { GetTripsResponse } from "../types/types";

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
}

export default TripService;
