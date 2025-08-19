import { User } from "../types/types";
import jwt from "jsonwebtoken";
import config from "../config/config";

export function generateAccessToken(user: User) {
  return jwt.sign(user, config.JWT_ACCESS_SECRET!, { expiresIn: "2m" });
}

export function generateRefreshToken(user: Pick<User, "email" | "nombre">) {
  return jwt.sign(user, config.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.JWT_ACCESS_SECRET!);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, config.JWT_REFRESH_SECRET!);
}

export function summaryResponse(summary: any[]) {
  const grouped: any = [];

  summary.forEach((item) => {
    let monthGroup = grouped.find((g: any) => g.mes_num === item.mes_num);

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
