// Servicios API de cuenta: perfil propio (/users) y administración (/usuarios).
// Cada clase es dueña de su basePath. La API habla camelCase en JSON.

import type { ResultType } from '@/Domain';
import type { SessionUserType } from '@/Domain/Entities/SessionEntity';
import type {
  AuthHeadersType,
  IUserProfileApiService,
} from '@/Application/Services/IUserProfileApiService';
import type {
  ChangeUserPasswordCommandType,
  IUsuariosApiService,
  RegenerateApiKeyCommandType,
  RegeneratedApiKeyType,
} from '@/Application/Services/IUsuariosApiService';
import type { ApiClient } from '@/Infrastructure/Api/ApiClient';
import { parseErr, vstr } from '@/Infrastructure/Api/api-helpers';

type CurrentUserDtoType = Record<string, unknown>;

export class UserProfileApiService implements IUserProfileApiService {
  constructor(
    private readonly api: ApiClient,
    private readonly basePath = '/users',
  ) {}

  async getCurrentUser(creds?: AuthHeadersType): Promise<ResultType<SessionUserType>> {
    const res = await this.api.get<CurrentUserDtoType>(
      `${this.basePath}/me`,
      creds
        ? { headers: { Authorization: `Bearer ${creds.access}`, 'X-API-Key': creds.apiKey } }
        : undefined,
    );
    if (!res.ok) return res;
    const dto = res.value;
    const id = vstr(dto, 'personaId');
    const login = vstr(dto, 'login');
    if (!id || !login) return parseErr<SessionUserType>('Usuario actual inválido');
    return {
      ok: true,
      value: {
        id,
        login,
        nombres: vstr(dto, 'nombres'),
        apellidos: vstr(dto, 'apellidos'),
        role: vstr(dto, 'role') || 'Member',
      },
    };
  }
}

type RegenerateApiKeyDtoType = Record<string, unknown>;

export class UsuariosApiService implements IUsuariosApiService {
  constructor(
    private readonly api: ApiClient,
    private readonly basePath = '/usuarios',
  ) {}

  async changeUserPassword(cmd: ChangeUserPasswordCommandType): Promise<ResultType<void>> {
    const res = await this.api.put<unknown>(
      `${this.basePath}/${encodeURIComponent(cmd.login)}/password`,
      { newPassword: cmd.newPassword },
    );
    if (!res.ok) return res;
    return { ok: true, value: undefined };
  }

  async regenerateApiKey(cmd: RegenerateApiKeyCommandType): Promise<ResultType<RegeneratedApiKeyType>> {
    const res = await this.api.get<RegenerateApiKeyDtoType>(
      `${this.basePath}/${encodeURIComponent(cmd.login)}/apikey`,
    );
    if (!res.ok) return res;
    const login = vstr(res.value, 'login');
    const apiKey = vstr(res.value, 'apiKey');
    if (!login || !apiKey) return parseErr<RegeneratedApiKeyType>('API key inválida');
    return { ok: true, value: { login, apiKey } };
  }
}
