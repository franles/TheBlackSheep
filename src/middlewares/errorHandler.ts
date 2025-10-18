import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/customErrors";
import logger from "../config/logger.config";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const status = isAppError ? err.status : 500;
  const message = isAppError ? err.message : "Error interno del servidor";

  // Preparar metadata del error
  const errorMeta = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get("user-agent"),
    ...(req.user && { userId: (req.user as any).email }),
    statusCode: status,
    errorName: err.name,
    ...(err.code && { errorCode: err.code }),
  };

  // Log según severidad
  if (!isAppError || status === 500) {
    // Errores internos del servidor - LOG COMPLETO con stack trace
    logger.error("Internal Server Error", {
      ...errorMeta,
      message: err.message,
      stack: err.stack,
      // Si hay error original, incluirlo
      ...(err.originalError && {
        originalError: {
          message: err.originalError.message,
          stack: err.originalError.stack,
        },
      }),
    });
  } else if (status >= 400 && status < 500) {
    // Errores del cliente - menos detalle
    logger.warn("Client Error", {
      ...errorMeta,
      message,
    });
  }

  // Log especial para errores de autenticación
  if (status === 401) {
    logger.warn("Unauthorized Access Attempt", {
      ...errorMeta,
      message,
    });
  }

  // Log especial para errores de validación
  if (status === 422) {
    logger.info("Validation Error", {
      ...errorMeta,
      message,
      ...(err.errors && { validationErrors: err.errors }),
    });
  }

  // Responder al cliente
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err.errors,
    }),
  });
}
