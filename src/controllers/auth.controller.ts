import { NextFunction, Request, Response } from "express";
import { User } from "../types/types";
import { generateAccessToken, verifyRefreshToken } from "../utils/utils";
import config from "../config/config";
import { ErrorFactory } from "../errors/errorFactory";

export async function login(req: Request, res: Response, next: NextFunction) {
  const { user, refreshToken, accessToken } = req.user as {
    user: User;
    accessToken: string;
    refreshToken: string;
  };

  try {
    console.log(refreshToken);
    console.log(accessToken);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, //cambiar a true cuando este en produccion
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${config.CLIENT_URL}/auth-success?token=${accessToken}`);
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ErrorFactory.unauthorized("Refresh token no proporcionado");
  }

  try {
    const user = verifyRefreshToken(refreshToken) as User;
    const newAccessToken = generateAccessToken({
      auth: true,
      nombre: user.nombre,
      email: user.email,
      avatar: user.avatar,
    });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "none",
      secure: true, // ponelo en true si estás en producción con HTTPS
    });
    res.status(200).json({ message: "Sesion cerrada exitosamente" });
  } catch (error) {
    next(error);
  }
}

export async function failure(req: Request, res: Response, next: NextFunction) {
  try {
    res.redirect(`${config.CLIENT_URL}/failure`);
  } catch (error) {
    next(error);
  }
}
