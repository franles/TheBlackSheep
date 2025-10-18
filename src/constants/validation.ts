export const VALIDATION = {
  TRIP: {
    DESTINO_VALUES: ['internacional', 'nacional'] as const,
    ESTADOS: ['pendiente', 'finalizado'] as const,
    APELLIDO_MIN_LENGTH: 2,
    APELLIDO_MAX_LENGTH: 50,
  },
  SERVICE: {
    PAGADO_POR_VALUES: ['mariana', 'pablo', 'soledad', 'pendiente'] as const,
    VALOR_MIN: 0.01,
    VALOR_MAX: 999999999,
  },
  FINANCE: {
    MIN_YEAR: 2025,
    MIN_MONTH: 1,
    MAX_MONTH: 12,
  },
  DB: {
    MAX_STRING_LENGTH: 100,
    CONNECTION_LIMIT: 10,
    IDLE_TIMEOUT: 60000,
  },
} as const;

export type DestinoType = typeof VALIDATION.TRIP.DESTINO_VALUES[number];
export type EstadoType = typeof VALIDATION.TRIP.ESTADOS[number];
export type PagadoPorType = typeof VALIDATION.SERVICE.PAGADO_POR_VALUES[number];
