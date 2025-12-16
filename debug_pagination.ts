
import { db } from "./src/db/db";
import { TripRepository } from "./src/repositories/trip.repository";
import { PoolConnection } from "mysql2/promise";
import * as fs from 'fs';
import * as util from 'util';

async function testPagination() {
    let conn: PoolConnection | null = null;
    try {
        const tripRepo = new TripRepository();
        console.log("START_DEBUG");
        conn = await db.getConnection();
        console.log("Got connection");

        try {
            await tripRepo.findAll(null, 10, 0, null, null, conn);
        } catch (e: any) {
            fs.writeFileSync('debug_error.json', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
            fs.writeFileSync('debug_error.txt', util.inspect(e));

            if (e.message && e.message.startsWith("DEBUG_RESULTS_PAYLOAD:")) {
                const payload = e.message.replace("DEBUG_RESULTS_PAYLOAD:", "");
                try {
                    fs.writeFileSync('debug_result.json', payload);
                    console.log("Debug data captured.");
                } catch (fsErr) {
                    console.error("Failed to write debug file:", fsErr);
                }
            } else {
                console.error("Unknown error:", e);
            }
        }
        console.log("END_DEBUG");

    } catch (error) {
        fs.writeFileSync('debug_fatal.txt', util.inspect(error));
        console.error("Test failed:", error);
    } finally {
        if (conn) conn.release();
        process.exit();
    }
}

testPagination();
