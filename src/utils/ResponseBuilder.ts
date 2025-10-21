import { PaginationDTO, PaginatedResponseDTO } from "../dtos/pagination.dto";

/**
 * Opciones para respuesta de éxito
 */
interface SuccessOptions<T> {
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

/**
 * Opciones para respuesta de error
 */
interface ErrorOptions {
  message: string;
  errors?: any[];
  code?: string;
  statusCode?: number;
}

/**
 * Utilidad para construir respuestas HTTP consistentes
 */
export class ResponseBuilder {
  /**
   * Construye una respuesta de éxito
   */
  static success<T>(options: SuccessOptions<T>) {
    const { data, message = 'Operación exitosa', meta } = options;

    return {
      success: true,
      message,
      data,
      ...(meta && { meta }),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Construye una respuesta de error
   */
  static error(options: ErrorOptions) {
    const { message, errors, code, statusCode } = options;

    return {
      success: false,
      message,
      ...(code && { code }),
      ...(statusCode && { statusCode }),
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Construye una respuesta paginada
   */
  static paginated<T>(data: T[], pagination: PaginationDTO): PaginatedResponseDTO<T> {
    return {
      data,
      pagination: {
        ...pagination,
        hasNextPage: pagination.currentPage < pagination.totalPages,
        hasPreviousPage: pagination.currentPage > 1,
      },
    };
  }

  /**
   * Construye respuesta para creación de recurso
   */
  static created<T>(data: T, message: string = 'Recurso creado exitosamente') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Construye respuesta para actualización de recurso
   */
  static updated<T>(data: T, message: string = 'Recurso actualizado exitosamente') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Construye respuesta para eliminación de recurso
   */
  static deleted(message: string = 'Recurso eliminado exitosamente') {
    return {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Construye respuesta sin contenido (204)
   */
  static noContent() {
    return null;
  }

  /**
   * Construye metadata de paginación
   */
  static buildPagination(
    currentPage: number,
    limit: number,
    totalItems: number
  ): PaginationDTO {
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    return {
      currentPage: Math.min(currentPage, totalPages),
      totalPages,
      totalItems,
      limit,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }

  /**
   * Construye respuesta con links de paginación (HATEOAS)
   */
  static paginatedWithLinks<T>(
    data: T[],
    pagination: PaginationDTO,
    baseUrl: string
  ) {
    const links: Record<string, string> = {
      self: `${baseUrl}?page=${pagination.currentPage}&limit=${pagination.limit}`,
    };

    if (pagination.hasNextPage) {
      links.next = `${baseUrl}?page=${pagination.currentPage + 1}&limit=${pagination.limit}`;
    }

    if (pagination.hasPreviousPage) {
      links.prev = `${baseUrl}?page=${pagination.currentPage - 1}&limit=${pagination.limit}`;
    }

    links.first = `${baseUrl}?page=1&limit=${pagination.limit}`;
    links.last = `${baseUrl}?page=${pagination.totalPages}&limit=${pagination.limit}`;

    return {
      data,
      pagination,
      links,
      timestamp: new Date().toISOString(),
    };
  }
}
