import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/utils";
import { ErrorFactory } from "../errors/errorFactory";

export function isAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw ErrorFactory.unauthorized("Token invalido");
    }

    const token = authorization.split(" ")[1];
    const user = verifyAccessToken(token);
    req.user = user;
    next();
  } catch (error) {
    throw ErrorFactory.unauthorized("No autorizado, token inválido o expirado");
  }
}
