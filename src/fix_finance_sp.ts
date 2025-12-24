
import { db } from "./db/db";

async function fixStoredProcedure() {
    const connection = await db.getConnection();

    const dropQuery = `DROP PROCEDURE IF EXISTS resumen_financiero;`;

    const createQuery = `
    CREATE PROCEDURE resumen_financiero(
      IN p_mes INT,
      IN p_anio INT,
      IN p_moneda INT
    )
    BEGIN
      SET lc_time_names = 'es_ES';

      SELECT
          MONTHNAME(v.fecha) AS mes,
          MONTH(v.fecha) AS mes_num,
          m.moneda,
          SUM(v.valor_total) AS ingreso,
          SUM(v.costo) AS egreso,
          (SUM(v.valor_total) - SUM(v.costo)) AS ganancia
      FROM viaje v
      INNER JOIN moneda m ON m.id = v.moneda_id
      WHERE YEAR(v.fecha) = p_anio
        AND (p_moneda IS NULL OR v.moneda_id = p_moneda)
        AND (p_mes IS NULL OR p_mes = 0 OR MONTH(v.fecha) = p_mes)
      GROUP BY MONTHNAME(v.fecha), MONTH(v.fecha), m.moneda, v.moneda_id
      ORDER BY mes_num, m.moneda;
    END;
  `;

    try {
        await connection.query(dropQuery);
        console.log("Procedimiento anterior eliminado.");
        await connection.query(createQuery);
        console.log("Nuevo procedimiento resumen_financiero creado correctamente.");
    } catch (error) {
        console.error("Error al actualizar el procedimiento:", error);
    } finally {
        connection.release();
        process.exit();
    }
}

fixStoredProcedure();
