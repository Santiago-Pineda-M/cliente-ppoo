// Port de datos remotos: administración de usuarios (/usuarios).
// Requiere JWT + X-Api-Key (policy ApiKey). Rutas en Infrastructure/Api/Users/.

import type { ResultType } from '@/Domain';
import type { RegeneratedApiKeyType } from '@/Domain/account';

export type { RegeneratedApiKeyType } from '@/Domain/account';

export type ChangeUserPasswordCommandType = {
  login: string;
  newPassword: string;
};

export type RegenerateApiKeyCommandType = {
  login: string;
};

export interface IUsuariosApiService {
  changeUserPassword(cmd: ChangeUserPasswordCommandType): Promise<ResultType<void>>;
  regenerateApiKey(cmd: RegenerateApiKeyCommandType): Promise<ResultType<RegeneratedApiKeyType>>;
}
