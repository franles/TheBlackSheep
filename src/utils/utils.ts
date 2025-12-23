import { UserDTO } from "../dtos/user.dto";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { AUTH } from "../constants/auth";

export function generateAccessToken(user: UserDTO): string {
  if (!config.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET no está configurado");
  }
  return jwt.sign(user, config.JWT_ACCESS_SECRET, {
    expiresIn: AUTH.ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(
  user: Pick<UserDTO, "email" | "nombre">
): string {
  if (!config.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET no está configurado");
  }
  return jwt.sign(user, config.JWT_REFRESH_SECRET, {
    expiresIn: AUTH.REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(
  token: string
): UserDTO | string | jwt.JwtPayload {
  if (!config.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET no está configurado");
  }
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(
  token: string
): UserDTO | string | jwt.JwtPayload {
  if (!config.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET no está configurado");
  }
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
}

import {
  FinanceSummaryItemDTO,
  FinanceSummaryResponseDTO,
  MonthSummaryDTO,
} from "../dtos/finance.dto";

export function summaryResponse(
  summary: FinanceSummaryItemDTO[]
): FinanceSummaryResponseDTO {
  const grouped: MonthSummaryDTO[] = [];

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

export function datetimeUtc3(date: Date): string {
  date.setUTCHours(date.getUTCHours() - 3);
  return date.toISOString();
}
