import { UserPayload } from "../types/types";
import jwt from "jsonwebtoken";
import config from "../config/config";

export function generateAccessToken(user: UserPayload) {
  return jwt.sign(user, config.JWT_ACCESS_SECRET!, { expiresIn: "15m" });
}

export function generateRefreshToken(user: UserPayload) {
  return jwt.sign(user, config.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.JWT_ACCESS_SECRET!);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, config.JWT_REFRESH_SECRET!);
}
