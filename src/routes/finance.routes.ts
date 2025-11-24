import { Router } from "express";
import DIContainer from "../core/DIContainer";

const router = Router();

/**
 * @swagger
 * /api/finance:
 *   get:
 *     summary: Obtener resumen financiero
 *     description: Retorna un resumen completo de las finanzas incluyendo ingresos totales, costos, ganancias, cantidad de viajes y tipos de cambio actuales
 *     tags: [Finanzas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen financiero obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Resumen financiero obtenido exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/FinanceSummaryDTO'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               message: Resumen financiero obtenido exitosamente
 *               data:
 *                 - mes: "julio"
 *                   mes_num: 7
 *                   resumen:
 *                     - moneda: "ars"
 *                       ingreso: 500000.00
 *                       egreso: 200000.00
 *                       ganancia: 300000.00
 *                     - moneda: "usd"
 *                       ingreso: 50000.00
 *                       egreso: 20000.00
 *                       ganancia: 30000.00
 *               timestamp: '2025-10-19T12:00:00Z'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

router.get("/", DIContainer.getFinanceController().getFinanceSummary);

export default router;
