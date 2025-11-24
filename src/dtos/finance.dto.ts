/**
 * DTO para query de resumen financiero
 */
export interface FinanceSummaryQueryDTO {
  mes?: number;
  anio: number;
  moneda: number | null;
}

export interface ExchangeRateDTO {
  id: number;
  fecha: Date;
  moneda_id: number;
  valor_base: number;
}
/**
 * DTO de respuesta para resumen financiero
 */
export type FinanceSummaryResponseDTO = MonthSummaryDTO[];

/**
 * DTO para resumen mensual
 */
export interface MonthSummaryDTO {
  mes: string;
  mes_num: number;
  resumen: CurrencySummaryDTO[];
}

/**
 * DTO para resumen por moneda
 */
export interface CurrencySummaryDTO {
  moneda: string;
  ingreso: number;
  egreso: number;
  ganancia: number;
}

/**
 * DTO para crear tipo de cambio
 */
export interface CreateExchangeRateDTO {
  moneda: number;
  valor_base: number;
}

/**
 * DTO para actualizar tipo de cambio
 */
export interface UpdateExchangeRateDTO {
  valor: number;
}
