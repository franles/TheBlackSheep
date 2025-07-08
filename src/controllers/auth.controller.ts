import { Request, Response } from "express";
import { User } from "../types/types";
import { generateAccessToken, verifyRefreshToken } from "../utils/utils";
import config from "../config/config";

export async function login(req: Request, res: Response) {
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
      secure: false, //cambiar a true cuando este en produccion
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesion", error });
  }
}

export async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.status(401).json({ message: "No existe dicho token" });
    return;
  }

  try {
    const user = verifyRefreshToken(refreshToken) as User;
    const newAccessToken = generateAccessToken({
      nombre: user.nombre,
      email: user.email,
    });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Token invalido o expirado", error });
  }
}

export async function status(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(200).json({ auth: false, message: "Usuario no logueado" });
      return;
    }

    const { email, nombre } = req.user as User;

    res.status(200).json({ auth: true, email, nombre });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la autenticación del usuario",
      error,
    });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    res.clearCookie("refreshToken");
    // res.redirect(config.CLIENT_URL!);
    res.status(200).json({ message: "Sesion cerrada exitosamente" });
  } catch (error) {
    res.status(500).json({ mesagge: "Error al cerrar sesion", error });
  }
}

export async function failure(req: Request, res: Response) {
  res.redirect(`${config.CLIENT_URL}/failure`);
}
