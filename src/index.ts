import { app } from "./config/app";
import config from "./config/config";
import logger from "./config/logger.config";

const PORT = config.PORT || 8080;

// Iniciar servidor
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server started successfully`, {
    port: PORT,
    nodeEnv: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });

  console.log(`\n✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔧 Entorno: ${config.NODE_ENV}\n`);
});

// Manejo de errores del servidor
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    logger.error(`Port ${PORT} is already in use`, { error: error.message });
    console.error(`\n❌ Error: El puerto ${PORT} ya está en uso\n`);
  } else {
    logger.error("Server error", {
      error: error.message,
      code: error.code,
      stack: error.stack,
    });
    console.error(`\n❌ Error del servidor: ${error.message}\n`);
  }
  process.exit(1);
});

// Manejo de cierre graceful
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received, closing server gracefully`, {
    timestamp: new Date().toISOString(),
  });

  console.log(`\n⚠️  ${signal} recibido, cerrando servidor...`);

  server.close(() => {
    logger.info("Server closed successfully", {
      signal,
      timestamp: new Date().toISOString(),
    });
    console.log("✅ Servidor cerrado correctamente\n");
    process.exit(0);
  });

  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    logger.error("Forced shutdown after timeout", { signal });
    console.error("❌ Cierre forzado después de timeout\n");
    process.exit(1);
  }, 10000);
};

// Escuchar señales de terminación
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Manejo de excepciones no capturadas
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  console.error("\n❌ Excepción no capturada:", error.message, "\n");
  process.exit(1);
});

// Manejo de promesas rechazadas no capturadas
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled Promise Rejection", {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString(),
    timestamp: new Date().toISOString(),
  });
  console.error("\n❌ Promise rechazada no manejada:", reason, "\n");
  process.exit(1);
});
