import { NextFunction, Request, Response } from "express";
import { User } from "../types/types";
import { generateAccessToken, verifyRefreshToken } from "../utils/utils";
import config from "../config/config";
import { ErrorFactory } from "../errors/errorFactory";
import { AUTH } from "../constants/auth";
import logger from "../config/logger.config";

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { user, refreshToken, accessToken } = req.user as {
    user: User;
    accessToken: string;
    refreshToken: string;
  };

  try {
    const isProduction = config.NODE_ENV === "production";

    logger.info("User logged in successfully", {
      email: user.email,
      name: user.nombre,
      timestamp: new Date().toISOString(),
    });

    res.cookie(AUTH.COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: AUTH.REFRESH_TOKEN_COOKIE_MAX_AGE,
    });

    res.redirect(`${config.CLIENT_URL}/auth-success?token=${accessToken}`);
  } catch (error) {
    logger.error("Login error", {
      email: user?.email,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    next(error);
  }
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    logger.warn("Refresh token attempt without token", {
      ip: req.ip,
    });
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

    logger.info("Token refreshed successfully", {
      email: user.email,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    logger.warn("Invalid refresh token attempt", {
      ip: req.ip,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const isProduction = config.NODE_ENV === "production";
    const user = req.user as User;

    logger.info("User logged out", {
      email: user?.email,
      timestamp: new Date().toISOString(),
    });

    res.clearCookie(AUTH.COOKIE_NAME, {
      httpOnly: true,
      sameSite: isProduction ? "strict" : "lax",
      secure: isProduction,
    });

    res.status(200).json({ message: "Sesion cerrada exitosamente" });
  } catch (error) {
    logger.error("Logout error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    next(error);
  }
}

export async function failure(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.warn("Authentication failure", {
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
    res.redirect(`${config.CLIENT_URL}/failure`);
  } catch (error) {
    next(error);
  }
}
