
import { db } from "./src/db/db";
import { TripRepository } from "./src/repositories/trip.repository";

async function repro() {
    try {
        console.log("REPRO START");
        const repo = new TripRepository();
        const conn = await db.getConnection();

        // Use parameters likely to reproduce the issue
        // "pendientes", 2025, limit 10
        const filter = "pendiente"; // or "desc"? User said "pendiente" in filters
        const limit = 10;
        const offset = 0;
        const month = null;
        const year = 2025;

        console.log(`Calling findAll with: filter=${filter}, year=${year}, month=${month}, limit=${limit}`);

        const results = await repo.findAll(filter, limit, offset, month, year, conn);

        console.log("REPRO RESULTS:");
        console.log("Data Length:", results.data.length);
        console.log("Total Found:", results.total);

        conn.release();
    } catch (e) {
        console.error("REPRO ERROR:", e);
    } finally {
        process.exit();
    }
}
repro();
