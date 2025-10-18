import { Request, Response, NextFunction } from "express";
import logger from "../config/logger.config";

/**
 * Middleware para logging de todas las peticiones HTTP
 * Registra método, URL, status code, duración y metadata
 */
export const httpLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  // Capturar información de la request
  const requestInfo = {
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get("user-agent"),
    ...(req.user && { userId: (req.user as any).email }),
  };

  // Log cuando la respuesta termine
  res.on("finish", () => {
    const duration = Date.now() - start;

    // Construir mensaje base
    const message = `${req.method} ${req.originalUrl}`;

    // Metadata completa
    const meta = {
      ...requestInfo,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get("content-length"),
    };

    // Log con nivel apropiado según status code
    if (res.statusCode >= 500) {
      logger.error(`${message} - Server Error`, meta);
    } else if (res.statusCode >= 400) {
      logger.warn(`${message} - Client Error`, meta);
    } else if (res.statusCode >= 300) {
      logger.http(`${message} - Redirect`, meta);
    } else {
      logger.http(`${message} - Success`, meta);
    }

    // Log adicional si la request fue muy lenta (> 3 segundos)
    if (duration > 3000) {
      logger.warn(`Slow Request Detected: ${message}`, {
        duration: `${duration}ms`,
        url: req.originalUrl,
        method: req.method,
      });
    }
  });

  // Log cuando hay error en la respuesta
  res.on("error", (error) => {
    logger.error("Response Error", {
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.originalUrl,
      ...requestInfo,
    });
  });

  next();
};

/**
 * Middleware para sanitizar y log de request body (no loguear passwords)
 */
export const logRequestBody = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.body && Object.keys(req.body).length > 0) {
    // Clonar body y sanitizar campos sensibles
    const sanitizedBody = { ...req.body };
    const sensitiveFields = ["password", "token", "secret", "authorization"];

    sensitiveFields.forEach((field) => {
      if (sanitizedBody[field]) {
        sanitizedBody[field] = "***REDACTED***";
      }
    });

    logger.dev("Request Body", {
      method: req.method,
      url: req.originalUrl,
      body: sanitizedBody,
    });
  }

  next();
};
