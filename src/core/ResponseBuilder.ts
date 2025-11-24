import { PaginationDTO, PaginatedResponseDTO } from "../dtos/pagination.dto";
import { datetimeUtc3 } from "../utils/utils";

interface SuccessOptions<T> {
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

interface ErrorOptions {
  message: string;
  errors?: any[];
  code?: string;
  statusCode?: number;
}

const date = new Date();

export class ResponseBuilder {
  static success<T>(options: SuccessOptions<T>) {
    const { data, message = "Operación exitosa", meta } = options;

    return {
      success: true,
      message,
      data,
      ...(meta && { meta }),
      timestamp: datetimeUtc3(date),
    };
  }

  static error(options: ErrorOptions) {
    const { message, errors, code, statusCode } = options;

    return {
      success: false,
      message,
      ...(code && { code }),
      ...(statusCode && { statusCode }),
      ...(errors && { errors }),
      timestamp: datetimeUtc3(date),
    };
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationDTO
  ): PaginatedResponseDTO<T> {
    return {
      data,
      pagination: {
        ...pagination,
        hasNextPage: pagination.currentPage < pagination.totalPages,
        hasPreviousPage: pagination.currentPage > 1,
      },
    };
  }

  static created<T>(data: T, message: string = "Recurso creado exitosamente") {
    return {
      success: true,
      message,
      data,
      timestamp: datetimeUtc3(date),
    };
  }

  static updated<T>(
    data: T,
    message: string = "Recurso actualizado exitosamente"
  ) {
    return {
      success: true,
      message,
      data,
      timestamp: datetimeUtc3(date),
    };
  }

  static deleted(message: string = "Recurso eliminado exitosamente") {
    return {
      success: true,
      message,
      timestamp: datetimeUtc3(date),
    };
  }

  static noContent() {
    return null;
  }

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

  static message(message: string) {
    return { message, timestamp: datetimeUtc3(date) };
  }

  static paginatedWithLinks<T>(
    data: T[],
    pagination: PaginationDTO,
    baseUrl: string
  ) {
    const links: Record<string, string> = {
      self: `${baseUrl}?page=${pagination.currentPage}&limit=${pagination.limit}`,
    };

    if (pagination.hasNextPage) {
      links.next = `${baseUrl}?page=${pagination.currentPage + 1}&limit=${
        pagination.limit
      }`;
    }

    if (pagination.hasPreviousPage) {
      links.prev = `${baseUrl}?page=${pagination.currentPage - 1}&limit=${
        pagination.limit
      }`;
    }

    links.first = `${baseUrl}?page=1&limit=${pagination.limit}`;
    links.last = `${baseUrl}?page=${pagination.totalPages}&limit=${pagination.limit}`;

    return {
      data,
      pagination,
      links,
      timestamp: datetimeUtc3(date),
    };
  }
}
