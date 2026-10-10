import type { IUseCase, ResultType } from '@/Domain';
import type { IAuthApiService } from '@/Application/Services/IAuthApiService';
import type { ISessionStoreService } from '@/Application/Services/ISessionStoreService';

// Cierra en el servidor (revoca el refresh) y siempre limpia lo local:
// aunque la red falle, la sesión del navegador no debe sobrevivir al logout.
export class LogoutUseCase implements IUseCase<undefined, void> {
  constructor(
    private readonly authApi: IAuthApiService,
    private readonly sessionStore: ISessionStoreService,
  ) {}

  async execute(_input: undefined): Promise<ResultType<void>> {
    const stored = this.sessionStore.load();
    const refreshToken = stored.ok && stored.value ? stored.value.refreshToken : null;
    try {
      await this.authApi.logout({ refreshToken });
    } catch {
      // Best-effort: lo local se limpia igual.
    }
    return this.sessionStore.clear();
  }
}
