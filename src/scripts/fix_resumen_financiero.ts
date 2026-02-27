import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixSP() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '123456',
        database: process.env.DB_NAME || 'theblacksheep',
    });

    try {
        // 1. Ver SP actual
        const [sp] = await conn.query("SHOW CREATE PROCEDURE resumen_financiero") as any;
        const spText: string = sp[0]?.['Create Procedure'] ?? '';
        console.log("=== SP ACTUAL (últimas 30 líneas) ===");
        console.log(spText.split('\n').slice(-30).join('\n'));

        // 2. Drop + recrear con soporte Mixto
        await conn.query("DROP PROCEDURE IF EXISTS resumen_financiero");
        console.log("\nSP eliminado.");

        const newSP = `CREATE PROCEDURE resumen_financiero(
  IN p_mes INT,
  IN p_anio INT,
  IN p_moneda INT
)
BEGIN
    SELECT
        T.moneda,
        MONTHNAME(T.fecha_ref) AS mes,
        MONTH(T.fecha_ref) AS mes_num,
        SUM(T.ingreso) AS ingreso,
        SUM(T.egreso) AS egreso,
        SUM(T.ingreso) - SUM(T.egreso) AS ganancia
    FROM (
        SELECT 'ars' AS moneda, 1 AS moneda_id, v.fecha AS fecha_ref,
               v.valor_total AS ingreso, IFNULL(v.costo, 0) AS egreso
        FROM viaje v
        WHERE v.moneda_id = 1 AND v.estado = 'finalizado' AND YEAR(v.fecha) = p_anio

        UNION ALL

        SELECT 'usd' AS moneda, 2 AS moneda_id, v.fecha AS fecha_ref,
               IFNULL(v.valor_total_usd, 0) AS ingreso, IFNULL(v.costo_usd, 0) AS egreso
        FROM viaje v
        WHERE v.moneda_id = 2 AND v.estado = 'finalizado' AND YEAR(v.fecha) = p_anio

        UNION ALL

        SELECT 'ars' AS moneda, 1 AS moneda_id, v.fecha AS fecha_ref,
               IFNULL(v.valor_total, 0) AS ingreso, IFNULL(v.costo, 0) AS egreso
        FROM viaje v
        WHERE v.moneda_id = 3 AND v.estado = 'finalizado' AND YEAR(v.fecha) = p_anio

        UNION ALL

        SELECT 'usd' AS moneda, 2 AS moneda_id, v.fecha AS fecha_ref,
               IFNULL(v.valor_total_usd, 0) AS ingreso, IFNULL(v.costo_usd, 0) AS egreso
        FROM viaje v
        WHERE v.moneda_id = 3 AND v.estado = 'finalizado' AND YEAR(v.fecha) = p_anio

    ) AS T
    WHERE (p_moneda IS NULL OR T.moneda_id = p_moneda)
      AND (p_mes IS NULL OR MONTH(T.fecha_ref) = p_mes)
    GROUP BY T.moneda, T.moneda_id, MONTH(T.fecha_ref), MONTHNAME(T.fecha_ref)
    ORDER BY mes_num, T.moneda;
END`;

        await conn.query(newSP);
        console.log("✅ SP resumen_financiero recreado con soporte Mixto.");

        // 3. Prueba
        const [test] = await conn.query("CALL resumen_financiero(NULL, YEAR(NOW()), NULL)") as any;
        console.log("\n=== RESULTADO PRUEBA ===");
        console.log(JSON.stringify(test[0] ?? test, null, 2));

    } catch (err: any) {
        console.error("❌ Error:", err?.message ?? err);
    } finally {
        await conn.end();
    }
}

fixSP();
