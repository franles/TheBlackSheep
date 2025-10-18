import { ErrorFactory } from '../errors/errorFactory';

/**
 * Parsea un valor opcional a entero con validación de rango
 */
export function parseOptionalInt(
  value: string | undefined | null,
  min?: number,
  max?: number
): number | null {
  if (!value || value === '') return null;

  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    return null;
  }

  if (min !== undefined && parsed < min) {
    throw ErrorFactory.badRequest(`El valor debe ser mayor o igual a ${min}`);
  }

  if (max !== undefined && parsed > max) {
    throw ErrorFactory.badRequest(`El valor debe ser menor o igual a ${max}`);
  }

  return parsed;
}

/**
 * Parsea un valor opcional a string
 */
export function parseOptionalString(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return String(value).trim();
}

/**
 * Parsea un valor que puede ser string o número
 */
export function parseStringOrNumber(value: unknown): string | number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const stringValue = String(value).trim();
  const numberValue = Number(stringValue);

  return isNaN(numberValue) ? stringValue : numberValue;
}

/**
 * Sanitiza un string limitando su longitud y eliminando espacios
 */
export function sanitizeString(
  value: string,
  maxLength: number = 100
): string {
  return value.trim().substring(0, maxLength);
}

/**
 * Valida que una fecha sea válida
 */
export function validateDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Valida que una fecha esté en un rango válido
 */
export function validateDateRange(
  startDate: Date,
  endDate: Date
): { valid: boolean; error?: string } {
  if (!validateDate(startDate)) {
    return { valid: false, error: 'Fecha de inicio inválida' };
  }

  if (!validateDate(endDate)) {
    return { valid: false, error: 'Fecha de fin inválida' };
  }

  if (startDate >= endDate) {
    return { valid: false, error: 'La fecha de inicio debe ser anterior a la fecha de fin' };
  }

  return { valid: true };
}
