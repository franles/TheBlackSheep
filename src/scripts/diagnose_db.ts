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

async function diagnose() {
    console.log('🔍 Iniciando diagnóstico de BD...');
    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('✅ Conectado a:', config.database);

        // 1. Verificar columnas en tabla viaje
        console.log('\n📊 Esquema de tabla "viaje":');
        const [columns]: any = await connection.query('DESCRIBE viaje');
        const columnNames = columns.map((c: any) => c.Field);
        console.log('Columnas encontradas:', columnNames.join(', '));

        if (!columnNames.includes('valor_tasa_cambio')) {
            console.error('❌ FATAL: La columna "valor_tasa_cambio" NO existe en la tabla "viaje".');
        } else {
            console.log('✅ La columna "valor_tasa_cambio" existe.');
        }

        // 2. Probar SP obtener_viajes
        console.log('\n🧪 Probando CALL obtener_viajes("desc", 10, 0, NULL, NULL)...');
        try {
            const [rows]: any = await connection.query('CALL obtener_viajes("desc", 10, 0, NULL, NULL)');
            console.log('✅ El SP se ejecutó correctamente. Resultados:', rows[0].length);
        } catch (err: any) {
            console.error('❌ Error al ejecutar SP:', err.sqlMessage || err.message);
            console.error('Código de error:', err.code);
        }

    } catch (error) {
        console.error('❌ Error de conexión:', error);
    } finally {
        if (connection) await connection.end();
    }
}

diagnose();
