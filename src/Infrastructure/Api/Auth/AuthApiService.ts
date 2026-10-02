// Servicio API del recurso auth. Dueño de la ruta (basePath único).
// Rutas públicas: auth:false (sin headers ni refresh).

import type { ResultType } from '@/Domain';
import { SessionEntity } from '@/Domain/Entities/SessionEntity';
import type {
  AuthSessionDtoType,
  IAuthApiService,
  LoginCommandType,
  RefreshSessionCommandType,
} from '@/Application/Services/IAuthApiService';
import type { ApiClient } from '@/Infrastructure/Api/ApiClient';

function toEntity(dto: AuthSessionDtoType): ResultType<SessionEntity> {
  return SessionEntity.create({
    accessToken: dto.accessToken,
    refreshToken: dto.refreshToken,
    apiKey: dto.apiKey,
    expiresAt: new Date(Date.now() + dto.expiresIn * 1000),
    user: dto.user,
  });
}

export class AuthApiService implements IAuthApiService {
  constructor(
    private readonly api: ApiClient,
    private readonly basePath = '/auth',
  ) {}

  async login(cmd: LoginCommandType): Promise<ResultType<SessionEntity>> {
    const res = await this.api.post<AuthSessionDtoType>(
      `${this.basePath}/login`,
      { identifier: cmd.identifier, password: cmd.password },
      { auth: false },
    );
    if (!res.ok) return res;
    return toEntity(res.value);
  }

  async refresh(cmd: RefreshSessionCommandType): Promise<ResultType<SessionEntity>> {
    const res = await this.api.post<AuthSessionDtoType>(
      `${this.basePath}/refresh`,
      { refreshToken: cmd.refreshToken, apiKey: cmd.apiKey },
      { auth: false },
    );
    if (!res.ok) return res;
    return toEntity(res.value);
  }
}
