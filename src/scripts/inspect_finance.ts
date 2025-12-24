import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'theblacksheep'
};

async function inspectData() {
    console.log('🔍 Inspeccionando datos y SP...');
    let connection;
    try {
        connection = await mysql.createConnection(config);

        // 1. Ver datos de viaje y servicios
        console.log('\n📊 Datos en tabla "viaje" (últimos 5):');
        const [viajes]: any = await connection.query('SELECT id, apellido, valor_total, costo, ganancia, moneda_id, cotizacion FROM viaje ORDER BY fecha DESC LIMIT 5');
        console.table(viajes);

        console.log('\n📊 Datos en tabla "servicio" (últimos 10):');
        const [servicios]: any = await connection.query('SELECT viaje_id, valor, moneda_id, cotizacion FROM servicio ORDER BY viaje_id DESC LIMIT 10');
        console.table(servicios);

        // 2. Ver definición del SP
        console.log('\n📜 Definición de "resumen_financiero":');
        const [spDef]: any = await connection.query('SHOW CREATE PROCEDURE resumen_financiero');
        if (spDef && spDef[0]) {
            console.log(spDef[0]['Create Procedure']);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

inspectData();
