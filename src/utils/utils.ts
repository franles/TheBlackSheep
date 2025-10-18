import { User } from "../types/types";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { AUTH } from "../constants/auth";

export function generateAccessToken(user: User): string {
  if (!config.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET no está configurado');
  }
  return jwt.sign(user, config.JWT_ACCESS_SECRET, { 
    expiresIn: AUTH.ACCESS_TOKEN_EXPIRY 
  });
}

export function generateRefreshToken(user: Pick<User, "email" | "nombre">): string {
  if (!config.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET no está configurado');
  }
  return jwt.sign(user, config.JWT_REFRESH_SECRET, { 
    expiresIn: AUTH.REFRESH_TOKEN_EXPIRY 
  });
}

export function verifyAccessToken(token: string): User | string | jwt.JwtPayload {
  if (!config.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET no está configurado');
  }
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token: string): User | string | jwt.JwtPayload {
  if (!config.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET no está configurado');
  }
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
}

interface FinanceSummaryItem {
  mes: string;
  mes_num: number;
  moneda: string;
  ingreso: number;
  egreso: number;
  ganancia: number;
}

interface GroupedSummary {
  mes: string;
  mes_num: number;
  resumen: Array<{
    moneda: string;
    ingreso: number;
    egreso: number;
    ganancia: number;
  }>;
}

export function summaryResponse(summary: FinanceSummaryItem[]): GroupedSummary[] {
  const grouped: GroupedSummary[] = [];

  summary.forEach((item) => {
    let monthGroup = grouped.find((g) => g.mes_num === item.mes_num);

    if (!monthGroup) {
      monthGroup = {
        mes: item.mes,
        mes_num: item.mes_num,
        resumen: [],
      };
      grouped.push(monthGroup);
    }

    monthGroup.resumen.push({
      moneda: item.moneda,
      ingreso: item.ingreso,
      egreso: item.egreso,
      ganancia: item.ganancia,
    });
  });

  return grouped;
}
