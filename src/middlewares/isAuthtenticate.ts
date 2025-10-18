import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/utils";
import { ErrorFactory } from "../errors/errorFactory";

export function isAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw ErrorFactory.unauthorized("Token no proporcionado");
    }

    // ✅ Validar formato del header
    if (!authorization.startsWith('Bearer ')) {
      throw ErrorFactory.unauthorized("Formato de token inválido");
    }

    const token = authorization.split(" ")[1];

    // ✅ Validar que el token no esté vacío
    if (!token || token.trim() === '') {
      throw ErrorFactory.unauthorized("Token vacío");
    }

    // ✅ Validar longitud razonable del token
    if (token.length > 1000) {
      throw ErrorFactory.unauthorized("Token demasiado largo");
    }

    const user = verifyAccessToken(token);

    // ✅ Validar estructura del usuario
    if (!user || typeof user !== 'object' || !('email' in user)) {
      throw ErrorFactory.unauthorized("Token inválido");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      next(ErrorFactory.unauthorized("Token expirado"));
    } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
      next(ErrorFactory.unauthorized("Token inválido"));
    } else {
      next(error);
    }
  }
}
