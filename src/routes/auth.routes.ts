import { Router } from "express";
import passport from "passport";
import {
  failure,
  login,
  logout,
  refreshToken,
} from "../controllers/auth.controller";
import { isAuthenticate } from "../middlewares/isAuthtenticate";

const router = Router();

/**
 * @swagger
 * /api/auth/callback:
 *   get:
 *     summary: Callback de Google OAuth 2.0
 *     description: Endpoint que Google llama después de que el usuario autoriza la aplicación. Genera tokens de acceso y actualización.
 *     tags: [Autenticación]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Código de autorización de Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Estado para validar la autenticidad de la petición
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *         headers:
 *           Set-Cookie:
 *             description: Cookie HttpOnly con el refresh token
 *             schema:
 *               type: string
 *               example: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
 *       302:
 *         description: Redirección en caso de fallo
 *         headers:
 *           Location:
 *             description: URL de redirección
 *             schema:
 *               type: string
 *               example: /api/auth/failure
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/callback",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    failureRedirect: `/api/auth/failure`,
    failureMessage: true,
    session: false,
  }),
  login
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refrescar token de acceso
 *     description: Genera un nuevo access token usando el refresh token almacenado en la cookie HttpOnly
 *     tags: [Autenticación]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
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
 *                   example: Token refrescado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: Nuevo JWT access token
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Invalida el refresh token y cierra la sesión del usuario
 *     tags: [Autenticación]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
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
 *                   example: Logout exitoso
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *         headers:
 *           Set-Cookie:
 *             description: Cookie HttpOnly eliminada
 *             schema:
 *               type: string
 *               example: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/logout", isAuthenticate, logout);

/**
 * @swagger
 * /api/auth/failure:
 *   get:
 *     summary: Endpoint de fallo de autenticación
 *     description: Endpoint al que se redirige cuando falla la autenticación con Google
 *     tags: [Autenticación]
 *     security: []
 *     responses:
 *       401:
 *         description: Fallo en la autenticación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Fallo en la autenticación con Google
 *               code: AUTH_FAILURE
 *               statusCode: 401
 *               timestamp: '2025-10-19T12:00:00Z'
 */
router.get("/failure", failure);

export default router;
