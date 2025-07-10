import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/utils";

export function isAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      res.status(401).json({ message: "Token no encontrado" });
      return;
    }

    const token = authorization.split(" ")[1];
    const user = verifyAccessToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error });
  }
}
