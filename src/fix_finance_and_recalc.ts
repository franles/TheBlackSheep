
import { db } from "./db/db";

async function fixFinanceAndRecalc() {
    const connection = await db.getConnection();

    console.log("Iniciando corrección de base de datos...");

    // 1. Corregir SP resumen_financiero
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
        await connection.query(createQuery);
        console.log("✅ Procedimiento 'resumen_financiero' actualizado correctamente.");
    } catch (error) {
        console.error("❌ Error al actualizar el procedimiento:", error);
    }

    // 2. Recalcular Costos (Disparar Triggers)
    // Actualizamos el valor a su mismo valor para disparar el trigger ON UPDATE
    const recalcQuery = `UPDATE servicio SET valor = valor WHERE viaje_id IS NOT NULL;`;

    try {
        const [result]: any = await connection.query(recalcQuery);
        console.log(`✅ Recálculo de costos completado. Servicios procesados: ${result.affectedRows}`);
        console.log("Nota: Esto ha disparado los triggers 'trg_calcular_costo_update' actualizando la columna 'costo' en la tabla 'viaje'.");
    } catch (error) {
        console.error("❌ Error al recalcular costos:", error);
    } finally {
        connection.release();
        process.exit();
    }
}

fixFinanceAndRecalc();
