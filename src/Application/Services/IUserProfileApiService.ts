// Port de datos remotos: perfil del usuario autenticado (GET /users/me)
// y operaciones de cuenta. Rutas en Infrastructure/Api/Users/.

import type { ResultType } from '@/Domain';
import type { SessionUserType } from '@/Domain/Entities/SessionEntity';

// Credenciales explícitas: el login obtiene el perfil con el par recién
// emitido, sin pasar por el store (el provider aún no lo conoce).
export type AuthHeadersType = {
  access: string;
  apiKey: string;
};

export interface IUserProfileApiService {
  getCurrentUser(creds?: AuthHeadersType): Promise<ResultType<SessionUserType>>;
}
