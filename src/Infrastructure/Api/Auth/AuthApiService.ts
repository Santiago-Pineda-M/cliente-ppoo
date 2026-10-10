// Servicio API del recurso auth. Dueño de la ruta (basePath único).
// Login/refresh son públicos (auth:false); el resto exige JWT.
// La API habla camelCase en JSON: el mapeo vive solo aquí.

import type { ResultType } from '@/Domain';
import type {
  AuthTokenPairType,
  ChangePasswordCommandType,
  IAuthApiService,
  LoginCommandType,
  LogoutCommandType,
  RefreshSessionCommandType,
  RevokeTokenCommandType,
} from '@/Application/Services/IAuthApiService';
import type { ApiClient } from '@/Infrastructure/Api/ApiClient';
import { isoDate, parseErr, val, vstr } from '@/Infrastructure/Api/api-helpers';

type TokenPairDtoType = Record<string, unknown>;

function toPair(dto: TokenPairDtoType): ResultType<AuthTokenPairType> {
  const accessToken = vstr(dto, 'accessToken');
  const refreshToken = vstr(dto, 'refreshToken');
  const apiKey = vstr(dto, 'apiKey');
  const expiresAt = isoDate(val(dto, 'accessTokenExpiresAtUtc'));
  if (!accessToken || !refreshToken || !apiKey || !expiresAt) {
    return parseErr<AuthTokenPairType>('Par de tokens inválido');
  }
  return { ok: true, value: { accessToken, refreshToken, apiKey, expiresAt } };
}

export class AuthApiService implements IAuthApiService {
  constructor(
    private readonly api: ApiClient,
    private readonly basePath = '/auth',
  ) {}

  async login(cmd: LoginCommandType): Promise<ResultType<AuthTokenPairType>> {
    const res = await this.api.post<TokenPairDtoType>(
      `${this.basePath}/login`,
      { login: cmd.login, password: cmd.password },
      { auth: false },
    );
    if (!res.ok) return res;
    return toPair(res.value);
  }

  async refresh(cmd: RefreshSessionCommandType): Promise<ResultType<AuthTokenPairType>> {
    const res = await this.api.post<TokenPairDtoType>(
      `${this.basePath}/refresh`,
      { refreshToken: cmd.refreshToken },
      { auth: false },
    );
    if (!res.ok) return res;
    return toPair(res.value);
  }

  async logout(cmd: LogoutCommandType): Promise<ResultType<void>> {
    const res = await this.api.post<unknown>(
      `${this.basePath}/logout`,
      { refreshToken: cmd.refreshToken },
    );
    if (!res.ok) return res;
    return { ok: true, value: undefined };
  }

  async revokeToken(cmd: RevokeTokenCommandType): Promise<ResultType<void>> {
    const res = await this.api.post<unknown>(
      `${this.basePath}/revoke-token`,
      { personaId: cmd.personaId, refreshToken: cmd.refreshToken },
    );
    if (!res.ok) return res;
    return { ok: true, value: undefined };
  }

  async changePassword(cmd: ChangePasswordCommandType): Promise<ResultType<void>> {
    const res = await this.api.post<unknown>(
      `${this.basePath}/change-password`,
      { currentPassword: cmd.currentPassword, newPassword: cmd.newPassword },
    );
    if (!res.ok) return res;
    return { ok: true, value: undefined };
  }
}
