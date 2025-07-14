import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/customErrors";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isAppError = err instanceof AppError;
  const status = isAppError ? err.status : 500;
  const message = isAppError ? err.message : "Error interno del servidor";

  if (!isAppError || status === 500) {
    console.log("Error interno", err);
  }

  res.status(status).json({ error: message });
}
