import { Router } from "express";
import {
  createTrip,
  deleteTrip,
  getTrip,
  getTrips,
  updateTrip,
} from "../controllers/trips.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { tripDeleteSchema, tripPostSchema } from "../middlewares/schemas/trips";

const router = Router();

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Obtener lista de viajes
 *     description: Retorna una lista paginada de viajes con filtros opcionales por apellido, destino, mes y año
 *     tags: [Viajes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/FilterParam'
 *       - $ref: '#/components/parameters/MonthParam'
 *       - $ref: '#/components/parameters/YearParam'
 *     responses:
 *       200:
 *         description: Lista de viajes obtenida exitosamente
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
 *                   example: Viajes obtenidos exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TripResponseDTO'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationDTO'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               message: Viajes obtenidos exitosamente
 *               data:
 *                 - id: 'tbs001'
 *                   estado: pendiente
 *                   fecha_ida: '2025-01-15'
 *                   fecha_vuelta: '2025-01-20'
 *                   moneda: USD
 *                   destino: 'nacional'
 *                   apellido: González
 *                   valor_total: 1500.50
 *                   ganancia: 300.50
 *                   costo: 1200.00
 *                   servicios:
 *                     - id: 1
 *                       valor: 500.00
 *                       nombre: Hotel
 *                       pagado_por: soledad
 *               pagination:
 *                 currentPage: 1
 *                 totalPages: 5
 *                 totalItems: 48
 *                 limit: 10
 *                 hasNextPage: true
 *                 hasPreviousPage: false
 *               timestamp: '2025-10-19T12:00:00Z'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", getTrips);

/**
 * @swagger
 * /api/trips/{tid}:
 *   get:
 *     summary: Obtener un viaje por ID
 *     description: Retorna los detalles completos de un viaje específico incluyendo sus servicios
 *     tags: [Viajes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TripIdParam'
 *     responses:
 *       200:
 *         description: Viaje obtenido exitosamente
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
 *                   example: Viaje obtenido exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/TripResponseDTO'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               message: Viaje obtenido exitosamente
 *               data:
 *                 id: 'tbs002'
 *                 estado: pendiente
 *                 fecha_ida: '2025-01-15'
 *                 fecha_vuelta: '2025-01-20'
 *                 moneda: USD
 *                 destino: 'internacional'
 *                 apellido: González
 *                 valor_total: 1500.50
 *                 ganancia: 300.50
 *                 costo: 1200.00
 *                 servicios:
 *                   - id: 1
 *                     valor: 500.00
 *                     nombre: Hotel
 *                     pagado_por: pablo
 *                   - id: 2
 *                     valor: 700.00
 *                     nombre: Transporte
 *                     pagado_por: mariana
 *               timestamp: '2025-10-19T12:00:00Z'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:tid", getTrip);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Crear un nuevo viaje
 *     description: Crea un nuevo viaje con sus servicios asociados. Todos los campos son obligatorios.
 *     tags: [Viajes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTripDTO'
 *           example:
 *             apellido: González
 *             valor_total: 1500.50
 *             destino: 'Mar del Plata'
 *             fecha_ida: '2025-01-15T10:00:00Z'
 *             fecha_vuelta: '2025-01-20T18:00:00Z'
 *             moneda: 1
 *             servicios:
 *               - id: 1
 *                 valor: 500.00
 *                 pagado_por: empresa
 *                 moneda: 1
 *               - id: 2
 *                 valor: 700.00
 *                 pagado_por: empresa
 *                 moneda: 1
 *     responses:
 *       201:
 *         description: Viaje creado exitosamente
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
 *                   example: Viaje creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/TripResponseDTO'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/", tripPostSchema, validateRequest, createTrip);

/**
 * @swagger
 * /api/trips/{tid}:
 *   patch:
 *     summary: Actualizar un viaje
 *     description: Actualiza parcialmente los datos de un viaje existente. Todos los campos son opcionales.
 *     tags: [Viajes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TripIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTripDTO'
 *           example:
 *             valor_total: 1600.00
 *             fecha_ida: 2025-05-10
 *             fecha_vuelta: 2025-05-19
 *             apellido: 'Gonzalez'
 *             moneda: 1
 *             destino: 'nacional'
 *             servicios:
 *               - id: 1
 *                 valor: 550.00
 *                 pagado_por: empresa
 *                 moneda: 1
 *     responses:
 *       200:
 *         description: Viaje actualizado exitosamente
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
 *                   example: Viaje actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/TripResponseDTO'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch("/:tid", updateTrip);

/**
 * @swagger
 * /api/trips/{tid}:
 *   delete:
 *     summary: Eliminar un viaje
 *     description: Elimina un viaje y todos sus servicios asociados de forma permanente
 *     tags: [Viajes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TripIdParam'
 *     responses:
 *       200:
 *         description: Viaje eliminado exitosamente
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
 *                   example: Viaje eliminado exitosamente
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               message: Viaje eliminado exitosamente
 *               timestamp: '2025-10-19T12:00:00Z'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete("/:tid", tripDeleteSchema, validateRequest, deleteTrip);

export default router;
