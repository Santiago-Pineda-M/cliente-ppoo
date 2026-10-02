// Port de datos remotos: recurso de autenticación (login/refresh).
// El UC nunca escribe URLs; la ruta vive en Infrastructure/Api/Auth/.

import type { ResultType } from '@/Domain';
import type { SessionEntity, SessionUserType } from '@/Domain/Entities/SessionEntity';

export type LoginCommandType = {
  identifier: string;
  password: string;
};

export type AuthSessionDtoType = {
  accessToken: string;
  refreshToken: string;
  apiKey: string;
  expiresIn: number;
  user: SessionUserType;
};

export type RefreshSessionCommandType = {
  refreshToken: string;
  apiKey: string;
};

export interface IAuthApiService {
  login(cmd: LoginCommandType): Promise<ResultType<SessionEntity>>;
  refresh(cmd: RefreshSessionCommandType): Promise<ResultType<SessionEntity>>;
}
