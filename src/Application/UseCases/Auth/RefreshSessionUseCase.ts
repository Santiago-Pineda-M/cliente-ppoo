import type { IUseCase, ResultType } from '@/Domain';
import { SessionEntity } from '@/Domain/Entities/SessionEntity';
import type { IAuthApiService } from '@/Application/Services/IAuthApiService';
import type { ISessionStoreService } from '@/Application/Services/ISessionStoreService';

function authErr(message: string): ResultType<never> {
  return { ok: false, error: { kind: 'auth', message } };
}

// Renueva el access con el refresh guardado; conserva el usuario en sesión
// (el refresh devuelve el par completo pero no el perfil).
export class RefreshSessionUseCase implements IUseCase<undefined, SessionEntity> {
  constructor(
    private readonly authApi: IAuthApiService,
    private readonly sessionStore: ISessionStoreService,
  ) {}

  async execute(_input: undefined): Promise<ResultType<SessionEntity>> {
    const stored = this.sessionStore.load();
    if (!stored.ok) return stored;
    if (!stored.value) return authErr('Sin sesión guardada');
    const current = stored.value;
    const refreshed = await this.authApi.refresh({ refreshToken: current.refreshToken });
    if (!refreshed.ok) return refreshed;
    const session = SessionEntity.create({
      accessToken: refreshed.value.accessToken,
      refreshToken: refreshed.value.refreshToken,
      apiKey: refreshed.value.apiKey,
      expiresAt: refreshed.value.expiresAt,
      user: current.user,
    });
    if (!session.ok) return session;
    const saved = this.sessionStore.save(session.value);
    if (!saved.ok) return saved;
    return session;
  }
}
