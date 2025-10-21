import { Router } from "express";
import {
  createExchangeRate,
  getFinanceSummary,
  updateExchangeRate,
} from "../controllers/finance.controller";

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

router.get("/", getFinanceSummary);

/**
 * @swagger
 * /api/finance/rate:
 *   post:
 *     summary: Crear nuevo tipo de cambio
 *     description: Crea un nuevo tipo de cambio para una moneda específica
 *     tags: [Finanzas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExchangeRateDTO'
 *           example:
 *             moneda: USD
 *             tasa: 1050.50
 *     responses:
 *       201:
 *         description: Tipo de cambio creado exitosamente
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
 *                   example: Tipo de cambio creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/ExchangeRateDTO'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               message: Tipo de cambio creado exitosamente
 *               data:
 *                 id: 3
 *                 moneda: USD
 *                 tasa: 1050.50
 *                 fecha_actualizacion: '2025-10-19T12:00:00Z'
 *               timestamp: '2025-10-19T12:00:00Z'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: La moneda ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: El tipo de cambio para esta moneda ya existe
 *               code: DUPLICATE_ENTRY
 *               statusCode: 409
 *               timestamp: '2025-10-19T12:00:00Z'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/rate", createExchangeRate);

/**
 * @swagger
 * /api/finance/rate/{rid}:
 *   patch:
 *     summary: Actualizar tipo de cambio
 *     description: Actualiza la tasa de cambio de una moneda existente
 *     tags: [Finanzas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ExchangeRateIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExchangeRateDTO'
 *           example:
 *             tasa: 1055.00
 *     responses:
 *       200:
 *         description: Tipo de cambio actualizado exitosamente
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
 *                   example: Tipo de cambio actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/ExchangeRateDTO'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               message: Tipo de cambio actualizado exitosamente
 *               data:
 *                 id: 1
 *                 moneda: USD
 *                 tasa: 1055.00
 *                 fecha_actualizacion: '2025-10-19T12:30:00Z'
 *               timestamp: '2025-10-19T12:30:00Z'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch("/rate/:rid", updateExchangeRate);

export default router;
