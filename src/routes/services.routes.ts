import { Router } from "express";
import {
  createServiceForTrip,
  deleteServiceForTrip,
  getServices,
  updateServiceForTrip,
} from "../controllers/services.controller";
import { servicesDeleteSchema } from "../middlewares/schemas/services";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Obtener lista de servicios disponibles
 *     description: Retorna todos los tipos de servicios disponibles que se pueden asociar a un viaje (Hotel, Transporte, etc.)
 *     tags: [Servicios]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de servicios obtenida exitosamente
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
 *                   example: Servicios obtenidos exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceResponseDTO'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               message: Servicios obtenidos exitosamente
 *               data:
 *                 - id: 1
 *                   nombre: Hotel
 *                   descripcion: Alojamiento en hoteles
 *                 - id: 2
 *                   nombre: Transporte
 *                   descripcion: Servicios de transporte terrestre
 *                 - id: 3
 *                   nombre: Alimentación
 *                   descripcion: Comidas y bebidas
 *                 - id: 4
 *                   nombre: Tours
 *                   descripcion: Excursiones y actividades turísticas
 *               timestamp: '2025-10-19T12:00:00Z'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", getServices);

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Agregar servicio a un viaje
 *     description: Asocia un servicio existente a un viaje específico con su respectivo valor y forma de pago
 *     tags: [Servicios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trip_id
 *               - service_id
 *               - valor
 *               - pagado_por
 *               - moneda
 *             properties:
 *               trip_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del viaje al que se asociará el servicio
 *                 example: '550e8400-e29b-41d4-a716-446655440000'
 *               service_id:
 *                 type: integer
 *                 description: ID del servicio a asociar
 *                 example: 1
 *               valor:
 *                 type: number
 *                 minimum: 0
 *                 description: Valor del servicio
 *                 example: 500.00
 *               pagado_por:
 *                 type: string
 *                 enum: [pasajero, empresa]
 *                 description: Quien paga el servicio
 *                 example: empresa
 *               moneda:
 *                 type: integer
 *                 description: ID de la moneda
 *                 example: 1
 *           example:
 *             trip_id: '550e8400-e29b-41d4-a716-446655440000'
 *             service_id: 1
 *             valor: 500.00
 *             pagado_por: empresa
 *             moneda: 1
 *     responses:
 *       201:
 *         description: Servicio agregado al viaje exitosamente
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
 *                   example: Servicio agregado al viaje exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/ServiceInTripDTO'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               message: Servicio agregado al viaje exitosamente
 *               data:
 *                 id: 1
 *                 valor: 500.00
 *                 nombre: Hotel
 *                 pagado_por: empresa
 *               timestamp: '2025-10-19T12:00:00Z'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Viaje o servicio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/", createServiceForTrip);

/**
 * @swagger
 * /api/services/{sid}/trip/{tid}:
 *   put:
 *     summary: Actualizar servicio de un viaje
 *     description: Actualiza el valor y/o forma de pago de un servicio asociado a un viaje
 *     tags: [Servicios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ServiceIdParam'
 *       - $ref: '#/components/parameters/TripIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - valor
 *               - pagado_por
 *               - moneda
 *             properties:
 *               valor:
 *                 type: number
 *                 minimum: 0
 *                 description: Nuevo valor del servicio
 *                 example: 550.00
 *               pagado_por:
 *                 type: string
 *                 enum: [pasajero, empresa]
 *                 description: Quien paga el servicio
 *                 example: empresa
 *               moneda:
 *                 type: integer
 *                 description: ID de la moneda
 *                 example: 1
 *           example:
 *             valor: 550.00
 *             pagado_por: empresa
 *             moneda: 1
 *     responses:
 *       200:
 *         description: Servicio actualizado exitosamente
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
 *                   example: Servicio actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/ServiceInTripDTO'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               message: Servicio actualizado exitosamente
 *               data:
 *                 id: 1
 *                 valor: 550.00
 *                 nombre: Hotel
 *                 pagado_por: empresa
 *               timestamp: '2025-10-19T12:00:00Z'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put("/:sid/trip/:tid", updateServiceForTrip);

/**
 * @swagger
 * /api/services/{sid}/trip/{tid}:
 *   delete:
 *     summary: Eliminar servicio de un viaje
 *     description: Desasocia un servicio de un viaje específico. El servicio no se elimina de la base de datos, solo se remueve del viaje.
 *     tags: [Servicios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ServiceIdParam'
 *       - $ref: '#/components/parameters/TripIdParam'
 *     responses:
 *       200:
 *         description: Servicio eliminado del viaje exitosamente
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
 *                   example: Servicio eliminado del viaje exitosamente
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               message: Servicio eliminado del viaje exitosamente
 *               timestamp: '2025-10-19T12:00:00Z'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  "/:sid/trip/:tid",
  servicesDeleteSchema,
  validateRequest,
  deleteServiceForTrip
);

export default router;
