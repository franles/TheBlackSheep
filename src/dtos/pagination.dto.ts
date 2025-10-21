/**
 * DTO para manejar la información de paginación
 * Utilizado para construir respuestas paginadas consistentes en toda la aplicación
 */
export interface PaginationDTO {
  /**
   * Página actual
   */
  currentPage: number;

  /**
   * Número total de páginas disponibles
   */
  totalPages: number;

  /**
   * Número total de elementos en la base de datos
   */
  totalItems: number;

  /**
   * Límite de elementos por página
   */
  limit: number;

  /**
   * Indica si existe una página siguiente
   */
  hasNextPage: boolean;

  /**
   * Indica si existe una página anterior
   */
  hasPreviousPage: boolean;
}

/**
 * DTO genérico para respuestas paginadas
 * @template T - Tipo de datos que se devolverán en el array
 */
export interface PaginatedResponseDTO<T> {
  /**
   * Array de datos de la página actual
   */
  data: T[];

  /**
   * Información de paginación
   */
  pagination: PaginationDTO;
}

/**
 * DTO para los parámetros de paginación en queries
 * Utilizado para recibir y validar parámetros de paginación en requests
 */
export interface PaginationQueryDTO {
  /**
   * Número de página solicitada (por defecto: 1)
   */
  page?: number;

  /**
   * Cantidad de elementos por página (por defecto: 10)
   */
  limit?: number;
}

/**
 * Opciones para construir paginación
 */
export interface BuildPaginationOptions {
  /**
   * Página actual solicitada
   */
  currentPage: number;

  /**
   * Límite de elementos por página
   */
  limit: number;

  /**
   * Total de elementos disponibles
   */
  totalItems: number;
}
