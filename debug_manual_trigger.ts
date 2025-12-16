
import { db } from "./src/db/db";
import { TripRepository } from "./src/repositories/trip.repository";

async function manualTrigger() {
    try {
        console.log("Manual trigger starting...");
        const repo = new TripRepository();
        const conn = await db.getConnection();
        await repo.findAll(null, 5, 0, null, null, conn);
        conn.release();
        console.log("Manual trigger done.");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
manualTrigger();
