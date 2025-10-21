import { PaginationMetaDTO } from '../dtos/trip.dto';

/**
 * Response estandarizada de éxito
 */
export interface SuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
  meta?: Record<string, any>;
}

/**
 * Response estandarizada de error
 */
export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: any[];
}

/**
 * Response paginada
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMetaDTO;
}

/**
 * Builder para respuestas HTTP estandarizadas
 */
export class ResponseBuilder {
  /**
   * Construir respuesta de éxito
   */
  static success<T>(
    data: T,
    message?: string,
    meta?: Record<string, any>
  ): SuccessResponse<T> {
    return {
      success: true,
      message: message || 'Operación exitosa',
      data,
      ...(meta && { meta }),
    };
  }

  /**
   * Construir respuesta de error
   */
  static error(
    message: string,
    errors?: any[],
    code?: string
  ): ErrorResponse {
    return {
      success: false,
      message,
      ...(code && { code }),
      ...(errors && { errors }),
    };
  }

  /**
   * Construir respuesta paginada
   */
  static paginated<T>(
    data: T[],
    pagination: PaginationMetaDTO,
    message?: string
  ): PaginatedResponse<T> {
    return {
      success: true,
      ...(message && { message }),
      data,
      pagination,
    };
  }

  /**
   * Construir respuesta para datos que ya vienen paginados
   * Usado cuando el servicio retorna { data, pagination }
   */
  static paginatedFromService<T>(result: { data: T[]; pagination: PaginationMetaDTO }, message?: string) {
    return {
      success: true,
      ...(message && { message }),
      ...result,
    };
  }

  /**
   * Construir respuesta simple de éxito (sin data)
   */
  static message(message: string): { message: string } {
    return { message };
  }

  /**
   * Construir metadata de paginación
   */
  static buildPaginationMeta(
    currentPage: number,
    totalItems: number,
    limit: number
  ): PaginationMetaDTO {
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    return {
      currentPage: Math.min(currentPage, totalPages),
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      limit,
    };
  }

  /**
   * Construir respuesta con data y mensaje
   */
  static created<T>(data: T, message: string = 'Recurso creado exitosamente'): SuccessResponse<T> {
    return this.success(data, message);
  }

  /**
   * Construir respuesta de actualización
   */
  static updated<T>(data: T, message: string = 'Recurso actualizado exitosamente'): SuccessResponse<T> {
    return this.success(data, message);
  }

  /**
   * Construir respuesta de eliminación
   */
  static deleted(message: string = 'Recurso eliminado exitosamente'): { message: string } {
    return this.message(message);
  }
}
