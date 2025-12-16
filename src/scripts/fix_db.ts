import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'theblacksheep',
  multipleStatements: true
};

async function fixDatabase() {
  console.log('🔌 Conectando a la base de datos...', config.host);
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Conectado.');

    const sqlUpdates = [
      // 1. Obtener Viajes (Fix 500 + Pagination)
      `DROP PROCEDURE IF EXISTS obtener_viajes`,
      `CREATE PROCEDURE obtener_viajes(
        IN filtro VARCHAR(20),   
        IN p_limit INT,
        IN p_offset INT,
        IN p_mes INT,           
        IN p_anio INT           
      )
      BEGIN
        DECLARE filtros TEXT DEFAULT '';
        DECLARE orden VARCHAR(10) DEFAULT 'DESC';
        DECLARE esEstado BOOLEAN DEFAULT FALSE;

        IF p_limit IS NULL OR p_limit <= 0 THEN SET p_limit = 10; END IF;
        IF p_offset IS NULL OR p_offset < 0 THEN SET p_offset = 0; END IF;

        IF LOWER(filtro) = 'asc' THEN SET orden = 'ASC';
        ELSEIF LOWER(filtro) = 'desc' THEN SET orden = 'DESC';
        END IF;

        IF LOWER(filtro) IN ('pendiente', 'finalizado', 'cancelado') THEN
          SET esEstado = TRUE;
          SET filtros = CONCAT(filtros, ' AND v.estado = "', filtro, '"');
        END IF;

        IF p_mes IS NOT NULL AND (p_anio IS NULL OR p_anio = 0) THEN
          SET filtros = CONCAT(filtros, ' AND MONTH(v.fecha) = ', p_mes, ' AND YEAR(v.fecha) = YEAR(CURDATE())');
        ELSEIF p_anio IS NOT NULL AND (p_mes IS NULL OR p_mes = 0) THEN
          SET filtros = CONCAT(filtros, ' AND YEAR(v.fecha) = ', p_anio);
        ELSEIF p_mes IS NOT NULL AND p_anio IS NOT NULL THEN
          SET filtros = CONCAT(filtros, ' AND MONTH(v.fecha) = ', p_mes, ' AND YEAR(v.fecha) = ', p_anio);
        END IF;

        SET @query = CONCAT(
          'SELECT 
            v.id,
            v.fecha,
            v.estado,
            v.apellido,
            v.valor_total,
            v.fecha_ida,
            v.fecha_vuelta,
            m.moneda,
            v.ganancia,
            v.costo,
            v.destino,
            v.valor_tasa_cambio,
            COALESCE(
              (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    "id", st.id,
                    "nombre", st.nombre,
                    "pagado_por", s.pagado_por,
                    "valor", s.valor,
                    "moneda", m_s.moneda,
                    "valor_tasa_cambio", s.valor_tasa_cambio
                  )
                )
                FROM servicio s
                LEFT JOIN servicio_tipo st ON s.servicio_tipo_id = st.id
                LEFT JOIN moneda m_s ON m_s.id = s.moneda_id
                WHERE s.viaje_id = v.id
              ), JSON_ARRAY()
            ) AS servicios
          FROM viaje v
          LEFT JOIN moneda m ON m.id = v.moneda_id
          WHERE 1=1 ',
          filtros,
          ' GROUP BY v.id, v.fecha, v.estado, v.apellido, v.valor_total, m.moneda, v.ganancia, v.costo, v.destino, v.fecha_ida, v.fecha_vuelta, v.valor_tasa_cambio',
          ' ORDER BY v.fecha ', orden, ', v.id ', orden,
          ' LIMIT ', p_limit,
          ' OFFSET ', p_offset
        );

        PREPARE stmt FROM @query;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        SET @count_query = CONCAT(
          'SELECT COUNT(*) AS total FROM viaje v WHERE 1=1 ', filtros
        );

        PREPARE stmt2 FROM @count_query;
        EXECUTE stmt2;
        DEALLOCATE PREPARE stmt2;
      END`
    ];

    console.log('🔄 Aplicando correcciones SQL...');
    for (const sql of sqlUpdates) {
      try {
        await connection.query(sql);
        console.log('✨ Ejecutado con éxito: ' + sql.substring(0, 50) + '...');
      } catch (err) {
        console.error('❌ Error ejecutando SQL:', err);
        // No detenemos, intentamos el siguiente
      }
    }

    console.log('✅ Correcciones aplicadas. Cierra este script y reinicia el servidor.');

  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    if (connection) await connection.end();
  }
}

fixDatabase();
