import { createPool } from "mysql2";
import config from "../config/config";
import { VALIDATION } from "../constants/validation";
import logger from "../config/logger.config";

// Validar configuración antes de crear el pool
if (!config.DB_NAME || !config.DB_HOST || !config.DB_USER) {
  const error =
    "Configuración de base de datos incompleta. Verifica las variables de entorno.";
  logger.error("Database configuration error", {
    hasDbName: !!config.DB_NAME,
    hasDbHost: !!config.DB_HOST,
    hasDbUser: !!config.DB_USER,
  });
  throw new Error(error);
}

const dbPort = config.DB_PORT ? parseInt(config.DB_PORT, 10) : 3306;

if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
  logger.error("Invalid database port", {
    port: config.DB_PORT,
    parsedPort: dbPort,
  });
  throw new Error(`Puerto de base de datos inválido: ${config.DB_PORT}`);
}

logger.info("Initializing database connection pool", {
  host: config.DB_HOST,
  port: dbPort,
  database: config.DB_NAME,
  connectionLimit: VALIDATION.DB.CONNECTION_LIMIT,
});

export const db = createPool({
  database: config.DB_NAME,
  host: config.DB_HOST,
  password: config.DB_PASSWORD,
  port: dbPort,
  user: config.DB_USER,
  timezone: "-03:00",
  waitForConnections: true,
  connectionLimit: VALIDATION.DB.CONNECTION_LIMIT,
  maxIdle: VALIDATION.DB.CONNECTION_LIMIT,
  idleTimeout: VALIDATION.DB.IDLE_TIMEOUT,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
}).promise();

// Contador de conexiones activas
let activeConnections = 0;

// Eventos para monitoreo
db.on("connection", (connection) => {
  activeConnections++;
  logger.debug("New database connection established", {
    activeConnections,
    connectionId: connection.threadId,
  });
});

db.on("acquire", (connection) => {
  logger.dev("Connection acquired from pool", {
    connectionId: connection.threadId,
    activeConnections,
  });
});

db.on("release", (connection) => {
  logger.dev("Connection released to pool", {
    connectionId: connection.threadId,
    activeConnections,
  });
});

db.on("enqueue", () => {
  logger.warn("Connection request queued - pool at max capacity", {
    connectionLimit: VALIDATION.DB.CONNECTION_LIMIT,
  });
});

// Test de conexión inicial
db.getConnection()
  .then((connection) => {
    logger.info("✅ Database connection pool initialized successfully", {
      host: config.DB_HOST,
      database: config.DB_NAME,
      connectionId: connection.threadId,
    });
    connection.release();
  })
  .catch((error) => {
    logger.error("❌ Failed to initialize database connection pool", {
      error: error.message,
      code: error.code,
      host: config.DB_HOST,
      database: config.DB_NAME,
    });
    // No lanzar error aquí para permitir que la app inicie
    // El error se manejará en las queries individuales
  });

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("Closing database connection pool...");
  try {
    await db.end();
    logger.info("Database connection pool closed successfully");
  } catch (error) {
    logger.error("Error closing database connection pool", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
