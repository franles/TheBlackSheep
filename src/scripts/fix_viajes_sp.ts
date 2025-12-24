import { db } from "../db/db";

async function fixViajesSP() {
    const connection = await db.getConnection();

    try {
        console.log("Corrigiendo SP insertar_viaje...");

        // Drop existing
        await connection.query("DROP PROCEDURE IF EXISTS insertar_viaje");

        // Create new with 'cotizacion'
        const createInsertQuery = `
      CREATE PROCEDURE insertar_viaje(
        IN p_apellido VARCHAR(50),
        IN p_valor_total DECIMAL(12,2),
        IN p_destino ENUM('nacional', 'internacional'),
        IN p_fecha_ida DATE,
        IN p_fecha_vuelta DATE,
        IN p_moneda_id INT,
        IN p_cotizacion DECIMAL(12,2)
      )
      BEGIN
        DECLARE new_id VARCHAR(6);

        INSERT INTO viaje (fecha, apellido, valor_total, destino, fecha_vuelta, fecha_ida, moneda_id, cotizacion)
        VALUES (
          DATE_SUB(NOW(), INTERVAL 3 HOUR),
          p_apellido,
          p_valor_total,
          p_destino,
          p_fecha_vuelta, 
          p_fecha_ida,
          p_moneda_id,
          p_cotizacion
        );
        
        SELECT id INTO new_id FROM viaje ORDER BY fecha DESC LIMIT 1;
        SELECT new_id AS id;
      END;
    `;

        await connection.query(createInsertQuery);
        console.log("SP insertar_viaje corregido exitosamente.");

        // Check actualizar_viaje as well just in case, ensuring consistency
        console.log("Asegurando SP actualizar_viaje...");
        await connection.query("DROP PROCEDURE IF EXISTS actualizar_viaje");

        const createUpdateQuery = `
      CREATE PROCEDURE actualizar_viaje(
        IN p_id VARCHAR(6), 
        IN p_apellido VARCHAR(50), 
        IN p_valor_total DECIMAL (12,2),
        IN p_destino ENUM ('nacional','internacional'),
        IN p_fecha_ida DATE,
        IN p_fecha_vuelta DATE,
        IN p_moneda_id INT,
        IN p_cotizacion DECIMAL(12,2)
      )
      BEGIN
          UPDATE viaje
          SET
              apellido = IFNULL(p_apellido, apellido),
              valor_total = IFNULL(p_valor_total, valor_total),
              destino = IFNULL(p_destino, destino),
              moneda_id = IFNULL(p_moneda_id, moneda_id),
              fecha_ida = IFNULL(p_fecha_ida, fecha_ida),
              fecha_vuelta = IFNULL(p_fecha_vuelta, fecha_vuelta),
              cotizacion = IFNULL(p_cotizacion, cotizacion)
          WHERE id = p_id;
          
          SELECT p_id AS id;
      END;
    `;
        await connection.query(createUpdateQuery);
        console.log("SP actualizar_viaje asegurado exitosamente.");

    } catch (error) {
        console.error("Error al corregir SPs:", error);
    } finally {
        connection.release();
        process.exit();
    }
}

fixViajesSP();
