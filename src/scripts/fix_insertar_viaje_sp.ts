import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'theblacksheep',
    multipleStatements: true
};

async function fixInsertarViajeSP() {
    console.log('Conectando a la base de datos...');
    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('Conectado.');

        // Check if valor_total_usd column exists
        console.log('Verificando si la columna valor_total_usd existe en la tabla viaje...');
        const [columns] = await connection.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'viaje' AND COLUMN_NAME = 'valor_total_usd'`,
            [config.database]
        ) as any[];

        if (columns.length === 0) {
            console.log('La columna valor_total_usd NO existe. Agregandola...');
            await connection.query(
                `ALTER TABLE viaje ADD COLUMN valor_total_usd DECIMAL(12,2) DEFAULT 0 AFTER valor_total`
            );
            console.log('Columna valor_total_usd agregada exitosamente.');
        } else {
            console.log('La columna valor_total_usd ya existe.');
        }

        console.log('Actualizando SP insertar_viaje...');
        await connection.query('DROP PROCEDURE IF EXISTS insertar_viaje');
        await connection.query(`
      CREATE PROCEDURE insertar_viaje(
        IN p_apellido VARCHAR(50),
        IN p_valor_total DECIMAL(12,2),
        IN p_valor_total_usd DECIMAL(12,2),
        IN p_destino ENUM('nacional', 'internacional'),
        IN p_fecha DATE,
        IN p_fecha_ida DATE,
        IN p_fecha_vuelta DATE,
        IN p_moneda_id INT,
        IN p_cotizacion DECIMAL(12,2)
      )
      BEGIN
        DECLARE new_id VARCHAR(6);

        INSERT INTO viaje (fecha, apellido, valor_total, valor_total_usd, destino, fecha_vuelta, fecha_ida, moneda_id, cotizacion)
        VALUES (
          p_fecha,
          p_apellido,
          p_valor_total,
          IFNULL(p_valor_total_usd, 0),
          p_destino,
          p_fecha_vuelta,
          p_fecha_ida,
          p_moneda_id,
          p_cotizacion
        );

        SELECT id INTO new_id FROM viaje ORDER BY fecha DESC LIMIT 1;
        SELECT new_id AS id;
      END
    `);
        console.log('SP insertar_viaje actualizado exitosamente.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixInsertarViajeSP();
