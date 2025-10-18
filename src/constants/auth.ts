export const AUTH = {
  ACCESS_TOKEN_EXPIRY: '10m',
  REFRESH_TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
  COOKIE_NAME: 'refreshToken',
} as const;
