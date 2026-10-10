// Port de datos remotos: arranque del sistema (POST /bootstrap/admin).
// Ruta pública, solo funciona con la base vacía. Ruta en Infrastructure/Api/Users/.

import type { ResultType } from '@/Domain';
import type { BootstrapAdminResultType } from '@/Domain/account';

export type { BootstrapAdminResultType } from '@/Domain/account';

export interface IBootstrapApiService {
  createAdmin(): Promise<ResultType<BootstrapAdminResultType>>;
}
