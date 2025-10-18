import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import config from "./config";

// Definir niveles de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colores para cada nivel
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

// Determinar el nivel de log según el entorno
const level = (): string => {
  const env = config.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "info";
};

// Formato para logs en consola (desarrollo)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;

    let msg = `${timestamp} [${level}]: ${message}`;

    // Si hay metadata adicional, agregarla
    if (Object.keys(meta).length > 0) {
      // Filtrar propiedades de winston
      const cleanMeta = Object.keys(meta)
        .filter(
          (key) =>
            !["Symbol(level)", "Symbol(message)", "Symbol(splat)"].includes(key)
        )
        .reduce((obj, key) => {
          obj[key] = meta[key];
          return obj;
        }, {} as Record<string, any>);

      if (Object.keys(cleanMeta).length > 0) {
        msg += `\n${JSON.stringify(cleanMeta, null, 2)}`;
      }
    }

    return msg;
  })
);

// Formato para logs en archivos (JSON para parsing)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Transports para diferentes tipos de logs
const transports: winston.transport[] = [];

// Console transport (solo en desarrollo)
if (config.NODE_ENV === "development") {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// File transport - Errores (con rotación diaria)
transports.push(
  new DailyRotateFile({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    level: "error",
    format: fileFormat,
    maxSize: "20m", // Máximo 20MB por archivo
    maxFiles: "14d", // Mantener logs por 14 días
    zippedArchive: true, // Comprimir logs antiguos
  })
);

// File transport - Todos los logs (con rotación diaria)
transports.push(
  new DailyRotateFile({
    filename: "logs/combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    format: fileFormat,
    maxSize: "20m",
    maxFiles: "14d",
    zippedArchive: true,
  })
);

// File transport - Solo HTTP requests (con rotación diaria)
transports.push(
  new DailyRotateFile({
    filename: "logs/http-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    level: "http",
    format: fileFormat,
    maxSize: "20m",
    maxFiles: "7d", // HTTP logs solo 7 días
    zippedArchive: true,
  })
);

// Crear el logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  // Manejar excepciones no capturadas
  exceptionHandlers: [
    new winston.transports.File({
      filename: "logs/exceptions.log",
      format: fileFormat,
    }),
  ],
  // Manejar promesas rechazadas no capturadas
  rejectionHandlers: [
    new winston.transports.File({
      filename: "logs/rejections.log",
      format: fileFormat,
    }),
  ],
  // No salir en errores
  exitOnError: false,
});

// Agregar método de utilidad para logs de desarrollo
logger.dev = (message: string, meta?: any) => {
  if (config.NODE_ENV === "development") {
    logger.debug(message, meta);
  }
};

// Método para logging de base de datos
logger.db = (query: string, duration?: number, meta?: any) => {
  const logData = {
    query,
    ...(duration && { duration: `${duration}ms` }),
    ...meta,
  };

  if (config.NODE_ENV === "development") {
    logger.debug("DB Query", logData);
  } else {
    logger.info("DB Query", logData);
  }
};

// Método para logging de requests HTTP
logger.request = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  meta?: any
) => {
  const logData = {
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    ...meta,
  };

  if (statusCode >= 500) {
    logger.error("HTTP Request Error", logData);
  } else if (statusCode >= 400) {
    logger.warn("HTTP Request Warning", logData);
  } else {
    logger.http("HTTP Request", logData);
  }
};

// Declaración de tipos para métodos personalizados
declare module "winston" {
  interface Logger {
    dev: (message: string, meta?: any) => void;
    db: (query: string, duration?: number, meta?: any) => void;
    request: (
      method: string,
      url: string,
      statusCode: number,
      duration: number,
      meta?: any
    ) => void;
  }
}

export default logger;
