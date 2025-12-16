
import { db } from "./src/db/db";
import { TripRepository } from "./src/repositories/trip.repository";
import { PoolConnection } from "mysql2/promise";
import * as util from 'util';
import * as fs from 'fs';

async function testFilters() {
    let conn: PoolConnection | null = null;
    try {
        const tripRepo = new TripRepository();
        conn = await db.getConnection();

        const filter = "desc";
        const limit = 5;
        const offset = 0;
        const month = 12;
        const year = 2025;

        const results = await tripRepo.findAll(filter, limit, offset, month, year, conn);

        const output = `Data Length: ${results.data.length}\nTotal: ${results.total}`;
        fs.writeFileSync('debug_filters_result.txt', output);

    } catch (error) {
        fs.writeFileSync('debug_filters_result.txt', "Error: " + util.inspect(error));
    } finally {
        if (conn) conn.release();
        process.exit();
    }
}

testFilters();
