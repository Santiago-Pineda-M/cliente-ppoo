// Servicio API de arranque del sistema (POST /bootstrap/admin, público).
// Dueño de la ruta (basePath único). La API habla camelCase en JSON.

import type { ResultType } from '@/Domain';
import type {
  BootstrapAdminResultType,
  IBootstrapApiService,
} from '@/Application/Services/IBootstrapApiService';
import type { ApiClient } from '@/Infrastructure/Api/ApiClient';
import { parseErr, vstr } from '@/Infrastructure/Api/api-helpers';

type BootstrapAdminDtoType = Record<string, unknown>;

export class BootstrapApiService implements IBootstrapApiService {
  constructor(
    private readonly api: ApiClient,
    private readonly basePath = '/bootstrap',
  ) {}

  async createAdmin(): Promise<ResultType<BootstrapAdminResultType>> {
    const res = await this.api.post<BootstrapAdminDtoType>(`${this.basePath}/admin`, {}, { auth: false });
    if (!res.ok) return res;
    const personaId = vstr(res.value, 'personaId');
    const login = vstr(res.value, 'login');
    const passwordGenerada = vstr(res.value, 'passwordGenerada');
    const apiKey = vstr(res.value, 'apiKey');
    if (!personaId || !login || !passwordGenerada || !apiKey) {
      return parseErr<BootstrapAdminResultType>('Respuesta de bootstrap inválida');
    }
    return { ok: true, value: { personaId, login, passwordGenerada, apiKey } };
  }
}
