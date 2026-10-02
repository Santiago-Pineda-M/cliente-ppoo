import type { ApiErrorType, IUseCase, ResultType } from '@/Domain';
import type { SessionEntity } from '@/Domain/Entities/SessionEntity';
import type { IAuthApiService } from '@/Application/Services/IAuthApiService';
import type { ISessionStoreService } from '@/Application/Services/ISessionStoreService';

function authErr(message: string): ResultType<never, ApiErrorType> {
  return { ok: false, error: { kind: 'auth', message } };
}

export class RefreshSessionUseCase implements IUseCase<undefined, SessionEntity> {
  constructor(
    private readonly authApi: IAuthApiService,
    private readonly sessionStore: ISessionStoreService,
  ) {}

  async execute(_input: undefined): Promise<ResultType<SessionEntity>> {
    const stored = this.sessionStore.load();
    if (!stored.ok) return stored;
    if (!stored.value) return authErr('Sin sesión guardada');
    const refreshed = await this.authApi.refresh({
      refreshToken: stored.value.refreshToken,
      apiKey: stored.value.apiKey,
    });
    if (!refreshed.ok) return refreshed;
    const saved = this.sessionStore.save(refreshed.value);
    if (!saved.ok) return saved;
    return refreshed;
  }
}
