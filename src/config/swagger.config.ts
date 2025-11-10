import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import config from "./config";

/**
 * Configuración de Swagger/OpenAPI
 *
 * Esta configuración define la documentación de la API usando OpenAPI 3.0.0
 * Incluye información general, servidores, componentes de seguridad y esquemas reutilizables
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "The Black Sheep API",
      version: "1.0.0",
      description: "API RESTful para gestión de viajes, servicios y finanzas",
      contact: {
        name: "API Support",
        email: "support@theblacksheep.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.PORT || 8080}`,
        description: "Servidor de desarrollo",
      },
      {
        url: config.API_URL || "https://api.theblacksheep.com",
        description: "Servidor de producción",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT token de autenticación. Se obtiene después del login con Google OAuth.",
        },
        CookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "refreshToken",
          description: "Refresh token almacenado en cookie HttpOnly",
        },
      },
      schemas: {
        // ==================== DTOs de Paginación ====================
        PaginationDTO: {
          type: "object",
          properties: {
            currentPage: {
              type: "integer",
              minimum: 1,
              description: "Página actual",
              example: 1,
            },
            totalPages: {
              type: "integer",
              minimum: 1,
              description: "Total de páginas disponibles",
              example: 5,
            },
            totalItems: {
              type: "integer",
              minimum: 0,
              description: "Total de elementos en la base de datos",
              example: 48,
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              description: "Cantidad de elementos por página",
              example: 10,
            },
            hasNextPage: {
              type: "boolean",
              description: "Indica si existe una página siguiente",
              example: true,
            },
            hasPreviousPage: {
              type: "boolean",
              description: "Indica si existe una página anterior",
              example: false,
            },
          },
          required: [
            "currentPage",
            "totalPages",
            "totalItems",
            "limit",
            "hasNextPage",
            "hasPreviousPage",
          ],
        },

        // ==================== DTOs de Viajes ====================
        CreateTripDTO: {
          type: "object",
          required: [
            "apellido",
            "valor_total",
            "destino",
            "fecha_ida",
            "fecha_vuelta",
            "moneda",
            "servicios",
          ],
          properties: {
            apellido: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              description: "Apellido del cliente",
              example: "González",
            },
            valor_total: {
              type: "number",
              minimum: 0,
              description: "Valor total del viaje",
              example: 1500.5,
            },
            destino: {
              type: "string",
              enum: ["Mar del Plata", "CABA", "Rosario"],
              description: "Destino del viaje",
              example: "Mar del Plata",
            },
            fecha_ida: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de ida",
              example: "2025-01-15T10:00:00Z",
            },
            fecha_vuelta: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de vuelta",
              example: "2025-01-20T18:00:00Z",
            },
            moneda: {
              type: "integer",
              description: "ID de la moneda utilizada",
              example: 1,
            },
            servicios: {
              type: "array",
              items: {
                $ref: "#/components/schemas/CreateServiceDTO",
              },
              minItems: 1,
              description: "Lista de servicios asociados al viaje",
            },
          },
        },

        UpdateTripDTO: {
          type: "object",
          properties: {
            apellido: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              description: "Apellido del cliente",
              example: "González",
            },
            valor_total: {
              type: "number",
              minimum: 0,
              description: "Valor total del viaje",
              example: 1600.0,
            },
            destino: {
              type: "string",
              enum: ["nacional", "internacional"],
              description: "Destino del viaje",
            },
            fecha_ida: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de ida",
            },
            fecha_vuelta: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de vuelta",
            },
            moneda: {
              type: "integer",
              description: "ID de la moneda utilizada",
            },
            servicios: {
              type: "array",
              items: {
                $ref: "#/components/schemas/UpdateServiceInTripDTO",
              },
              description: "Lista de servicios a actualizar",
            },
          },
        },

        TripResponseDTO: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del viaje",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            estado: {
              type: "string",
              enum: ["pendiente", "finalizado"],
              description: "Estado actual del viaje",
              example: "pendiente",
            },
            fecha_ida: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de ida",
              example: "2025-01-15T10:00:00Z",
            },
            fecha_vuelta: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de vuelta",
              example: "2025-01-20T18:00:00Z",
            },
            moneda: {
              type: "string",
              description: "Nombre de la moneda",
              example: "USD",
            },
            destino: {
              type: "string",
              enum: ["Mar del Plata", "CABA", "Rosario"],
              description: "Destino del viaje",
              example: "Mar del Plata",
            },
            apellido: {
              type: "string",
              description: "Apellido del cliente",
              example: "González",
            },
            valor_total: {
              type: "number",
              description: "Valor total del viaje",
              example: 1500.5,
            },
            ganancia: {
              type: "number",
              description: "Ganancia calculada del viaje",
              example: 300.5,
            },
            costo: {
              type: "number",
              description: "Costo total del viaje",
              example: 1200.0,
            },
            servicios: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ServiceInTripDTO",
              },
              description: "Servicios asociados al viaje",
            },
          },
        },

        // ==================== DTOs de Servicios ====================
        CreateServiceDTO: {
          type: "object",
          required: ["id", "valor", "pagado_por", "moneda"],
          properties: {
            id: {
              type: "integer",
              description: "ID del servicio",
              example: 1,
            },
            valor: {
              type: "number",
              minimum: 0,
              description: "Valor del servicio",
              example: 250.0,
            },
            pagado_por: {
              type: "string",
              enum: ["pasajero", "empresa"],
              description: "Quien pagó el servicio",
              example: "empresa",
            },
            moneda: {
              type: "integer",
              description: "ID de la moneda",
              example: 1,
            },
          },
        },

        CurrencySummaryDTO: {
          type: "object",
          description: "Resumen de finanzas para una moneda específica",
          properties: {
            moneda: {
              type: "string",
              description: "Nombre de la moneda",
              example: "usd",
            },
            ingreso: {
              type: "number",
              format: "float",
              description: "Monto total de ingresos",
              example: 64444.0,
            },
            egreso: {
              type: "number",
              format: "float",
              description: "Monto total de egresos",
              example: 20500.0,
            },
            ganancia: {
              type: "number",
              format: "float",
              description: "Ganancia neta",
              example: 43944.0,
            },
          },
          required: ["moneda", "ingreso", "egreso", "ganancia"],
        },

        FinanceSummaryDTO: {
          type: "object",
          description:
            "Resumen financiero para un mes específico (corresponde a MonthSummaryDTO)",
          properties: {
            mes: {
              type: "string",
              description: "Nombre del mes",
              example: "septiembre",
            },
            mes_num: {
              type: "integer",
              description: "Número del mes (1-12)",
              example: 9,
            },
            resumen: {
              type: "array",
              description: "Lista de resúmenes por moneda",
              items: {
                $ref: "#/components/schemas/CurrencySummaryDTO",
              },
            },
          },
          required: ["mes", "mes_num", "resumen"],
        },

        UpdateServiceInTripDTO: {
          type: "object",
          required: ["id", "valor", "pagado_por", "moneda"],
          properties: {
            id: {
              type: "integer",
              description: "ID del servicio",
              example: 1,
            },
            valor: {
              type: "number",
              minimum: 0,
              description: "Valor del servicio",
              example: 275.0,
            },
            pagado_por: {
              type: "string",
              enum: ["pasajero", "empresa"],
              description: "Quien pagó el servicio",
              example: "empresa",
            },
            moneda: {
              type: "integer",
              description: "ID de la moneda",
              example: 1,
            },
          },
        },

        ServiceInTripDTO: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "ID del servicio",
              example: 1,
            },
            valor: {
              type: "number",
              description: "Valor del servicio",
              example: 250.0,
            },
            nombre: {
              type: "string",
              description: "Nombre del servicio",
              example: "Hotel",
            },
            pagado_por: {
              type: "string",
              enum: ["pasajero", "empresa"],
              description: "Quien pagó el servicio",
              example: "empresa",
            },
          },
        },

        ServiceResponseDTO: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "ID del servicio",
              example: 1,
            },
            nombre: {
              type: "string",
              description: "Nombre del servicio",
              example: "Hotel",
            },
          },
        },

        ExchangeRateDTO: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "ID del tipo de cambio",
              example: 1,
            },
            moneda: {
              type: "string",
              description: "Código de la moneda",
              example: "USD",
            },
            tasa: {
              type: "number",
              description: "Tasa de cambio",
              example: 1050.5,
            },
            fecha_actualizacion: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
              example: "2025-10-19T12:00:00Z",
            },
          },
        },

        CreateExchangeRateDTO: {
          type: "object",
          required: ["moneda", "tasa"],
          properties: {
            moneda: {
              type: "string",
              minLength: 3,
              maxLength: 3,
              description: "Código de la moneda (ISO 4217)",
              example: "USD",
            },
            tasa: {
              type: "number",
              minimum: 0,
              description: "Tasa de cambio",
              example: 1050.5,
            },
          },
        },

        UpdateExchangeRateDTO: {
          type: "object",
          required: ["tasa"],
          properties: {
            tasa: {
              type: "number",
              minimum: 0,
              description: "Nueva tasa de cambio",
              example: 1055.0,
            },
          },
        },

        // ==================== Respuestas Estándar ====================
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operación exitosa",
            },
            data: {
              type: "object",
              description: "Datos de la respuesta",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2025-10-19T12:00:00Z",
            },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error en la operación",
            },
            code: {
              type: "string",
              example: "VALIDATION_ERROR",
            },
            statusCode: {
              type: "integer",
              example: 400,
            },
            errors: {
              type: "array",
              items: {
                type: "object",
              },
              description: "Detalles de los errores",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2025-10-19T12:00:00Z",
            },
          },
        },

        PaginatedResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
              },
              description: "Array de datos paginados",
            },
            pagination: {
              $ref: "#/components/schemas/PaginationDTO",
            },
          },
        },

        // ==================== DTOs de Autenticación ====================
        UserDTO: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del usuario",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email del usuario",
              example: "user@example.com",
            },
            nombre: {
              type: "string",
              description: "Nombre completo del usuario",
              example: "Juan Pérez",
            },
            foto: {
              type: "string",
              format: "uri",
              nullable: true,
              description: "URL de la foto de perfil",
              example: "https://example.com/avatar.jpg",
            },
          },
        },

        LoginResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Login exitoso",
            },
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/UserDTO",
                },
                accessToken: {
                  type: "string",
                  description: "JWT access token",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Token de acceso faltante o inválido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "No autorizado",
                code: "UNAUTHORIZED",
                statusCode: 401,
                timestamp: "2025-10-19T12:00:00Z",
              },
            },
          },
        },
        ForbiddenError: {
          description: "No tienes permisos para acceder a este recurso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "Acceso denegado",
                code: "FORBIDDEN",
                statusCode: 403,
                timestamp: "2025-10-19T12:00:00Z",
              },
            },
          },
        },
        NotFoundError: {
          description: "Recurso no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "Recurso no encontrado",
                code: "NOT_FOUND",
                statusCode: 404,
                timestamp: "2025-10-19T12:00:00Z",
              },
            },
          },
        },
        ValidationError: {
          description: "Error de validación en los datos enviados",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "Error de validación",
                code: "VALIDATION_ERROR",
                statusCode: 400,
                errors: [
                  {
                    field: "apellido",
                    message: "El apellido es requerido",
                  },
                ],
                timestamp: "2025-10-19T12:00:00Z",
              },
            },
          },
        },
        ServerError: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "Error interno del servidor",
                code: "INTERNAL_ERROR",
                statusCode: 500,
                timestamp: "2025-10-19T12:00:00Z",
              },
            },
          },
        },
      },
      parameters: {
        TripIdParam: {
          name: "tid",
          in: "path",
          required: true,
          description: "ID del viaje",
          schema: {
            type: "string",
            format: "uuid",
          },
        },
        ServiceIdParam: {
          name: "sid",
          in: "path",
          required: true,
          description: "ID del servicio",
          schema: {
            type: "integer",
          },
        },
        ExchangeRateIdParam: {
          name: "rid",
          in: "path",
          required: true,
          description: "ID del tipo de cambio",
          schema: {
            type: "integer",
          },
        },
        PageParam: {
          name: "page",
          in: "query",
          description: "Número de página",
          schema: {
            type: "integer",
            minimum: 1,
            default: 1,
          },
        },
        LimitParam: {
          name: "limit",
          in: "query",
          description: "Cantidad de elementos por página",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 10,
          },
        },
        FilterParam: {
          name: "filter",
          in: "query",
          description: "Filtro por apellido o destino",
          schema: {
            type: "string",
          },
        },
        MonthParam: {
          name: "month",
          in: "query",
          description: "Filtro por mes (1-12)",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 12,
          },
        },
        YearParam: {
          name: "year",
          in: "query",
          description: "Filtro por año",
          schema: {
            type: "integer",
            minimum: 2000,
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Autenticación",
        description: "Endpoints de autenticación con Google OAuth 2.0",
      },
      {
        name: "Viajes",
        description: "Gestión de viajes (CRUD completo)",
      },
      {
        name: "Servicios",
        description: "Gestión de servicios asociados a viajes",
      },
      {
        name: "Finanzas",
        description: "Consultas financieras y gestión de tipos de cambio",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Ruta donde están tus archivos de rutas
};

// Generar especificación Swagger
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Configura Swagger UI en la aplicación Express
 * @param app - Instancia de Express
 */
export const setupSwagger = (app: Express): void => {
  // Ruta para la documentación UI
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "The Black Sheep API Docs",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: "none",
        filter: true,
        showRequestHeaders: true,
      },
    })
  );

  // Ruta para obtener el spec en formato JSON
  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(
    `📚 Swagger docs disponibles en: http://localhost:${
      config.PORT || 8080
    }/api-docs`
  );
};

export default swaggerSpec;
