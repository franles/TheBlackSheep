import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'theblacksheep'
};

async function migrate() {
    console.log('🏗️ Iniciando migración de esquema...');
    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('✅ Conectado a la base de datos.');

        // 1. Agregar columna a tabla VIAJE
        try {
            console.log('Alterando tabla VIAJE...');
            await connection.query('ALTER TABLE viaje ADD COLUMN valor_tasa_cambio DECIMAL(12,2) NULL');
            console.log('✅ Columna "valor_tasa_cambio" agregada a VIAJE.');
        } catch (err: any) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ La columna ya existe en VIAJE.');
            } else {
                throw err;
            }
        }

        // 2. Renombrar columna en tabla SERVICIO
        try {
            console.log('Alterando tabla SERVICIO...');
            // Check if column exists first or just try rename
            // MySQL 8.0+: ALTER TABLE servicio RENAME COLUMN valor_tasa_cambio TO cotizacion;
            // MariaDB/Older: ALTER TABLE servicio CHANGE COLUMN valor_tasa_cambio cotizacion DECIMAL(12,2) NULL;
            // We'll use CHANGE COLUMN for better compatibility
            await connection.query('ALTER TABLE servicio CHANGE COLUMN valor_tasa_cambio cotizacion DECIMAL(12,2) NULL');
            console.log('✅ Columna "valor_tasa_cambio" renombrada a "cotizacion" en SERVICIO.');
        } catch (err: any) {
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                console.log('ℹ️ La columna "valor_tasa_cambio" no existe o "cotizacion" ya está definida.');
            } else {
                console.error('⚠️ Error al renombrar columna (puede que ya esté renombrada):', err.message);
            }
        }

        console.log('🎉 Migración completada con éxito.');

    } catch (error) {
        console.error('❌ Error fatal en migración:', error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
