// Port de datos remotos: recurso de autenticación (/auth).
// Solo tokens: el usuario se obtiene vía IUserProfileApiService.
// El UC nunca escribe URLs; la ruta vive en Infrastructure/Api/Auth/.

import type { ResultType } from '@/Domain';

export type LoginCommandType = {
  login: string;
  password: string;
};

export type RefreshSessionCommandType = {
  refreshToken: string;
};

export type LogoutCommandType = {
  refreshToken: string | null;
};

export type RevokeTokenCommandType = {
  personaId: string;
  refreshToken: string;
};

export type ChangePasswordCommandType = {
  currentPassword: string;
  newPassword: string;
};

// Par sin usuario: lo que devuelven POST /auth/login y POST /auth/refresh
// (AccessToken*, RefreshToken*, ApiKey en PascalCase en la API).
export type AuthTokenPairType = {
  accessToken: string;
  refreshToken: string;
  apiKey: string;
  expiresAt: Date;
};

export interface IAuthApiService {
  login(cmd: LoginCommandType): Promise<ResultType<AuthTokenPairType>>;
  refresh(cmd: RefreshSessionCommandType): Promise<ResultType<AuthTokenPairType>>;
  logout(cmd: LogoutCommandType): Promise<ResultType<void>>;
  revokeToken(cmd: RevokeTokenCommandType): Promise<ResultType<void>>;
  changePassword(cmd: ChangePasswordCommandType): Promise<ResultType<void>>;
}
