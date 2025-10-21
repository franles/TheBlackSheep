/**
 * DTO para usuario
 */
export interface UserDTO {
  auth: boolean;
  email: string;
  nombre: string;
  avatar: string;
}

/**
 * DTO para login response
 */
export interface LoginResponseDTO {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}

/**
 * DTO para refresh token
 */
export interface RefreshTokenResponseDTO {
  accessToken: string;
}
