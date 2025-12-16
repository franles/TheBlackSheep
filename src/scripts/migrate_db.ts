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

        // 2. Agregar columna a tabla SERVICIO
        try {
            console.log('Alterando tabla SERVICIO...');
            await connection.query('ALTER TABLE servicio ADD COLUMN valor_tasa_cambio DECIMAL(12,2) NULL');
            console.log('✅ Columna "valor_tasa_cambio" agregada a SERVICIO.');
        } catch (err: any) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ La columna ya existe en SERVICIO.');
            } else {
                throw err;
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
