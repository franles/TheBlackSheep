import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'theblacksheep',
    multipleStatements: true // Important for running scripts, though we'll split manually too
};

async function updateProcedures() {
    console.log('🔄 Iniciando actualización de Stored Procedures...');
    let connection;
    try {
        const sqlPath = path.resolve(process.cwd(), '../sql_updates.sql');
        console.log(`📖 Leyendo archivo SQL: ${sqlPath}`);

        const sqlContent = await fs.readFile(sqlPath, 'utf-8');

        connection = await mysql.createConnection(config);
        console.log('✅ Conectado a la base de datos.');

        // Simple parsing for DELIMITER ;;
        // We'll split by ';;' which is the delimiter used in the file
        const statements = sqlContent.split(';;');

        for (const statement of statements) {
            let cleanStmt = statement.trim();

            // Remove DELIMITER commands and comments
            if (cleanStmt.toLowerCase().startsWith('delimiter')) {
                continue;
            }

            if (!cleanStmt) continue;

            try {
                // Execute statement
                await connection.query(cleanStmt);

                // Log progress (extract first line or procedure name for clarity)
                const firstLine = cleanStmt.split('\n')[0];
                if (firstLine.toLowerCase().includes('create procedure')) {
                    console.log(`✅ Ejecutado: ${firstLine.replace(/`/g, '')}...`);
                } else if (firstLine.toLowerCase().includes('drop procedure')) {
                    // don't spam logs
                } else {
                    console.log(`ℹ️ Ejecutado bloque SQL genérico.`);
                }

            } catch (err: any) {
                console.error(`❌ Error ejecutando sentencia: ${cleanStmt.substring(0, 50)}...`);
                console.error(err.message);
                // Don't throw, try to continue (e.g. if DROP fails because not exists)
            }
        }

        console.log('🎉 Actualización de procedimientos completada.');

    } catch (error) {
        console.error('❌ Error fatal:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateProcedures();
