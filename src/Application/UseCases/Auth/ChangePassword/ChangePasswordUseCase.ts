import type { IUseCase, ResultType } from '@/Domain';
import type { IAuthApiService, ChangePasswordCommandType } from '@/Application/Services/IAuthApiService';
import type { ISessionStoreService } from '@/Application/Services/ISessionStoreService';

// Cambio de contraseña propio. La API invalida el access actual,
// así que al éxito se limpia la sesión y hay que volver a entrar.
export class ChangePasswordUseCase implements IUseCase<ChangePasswordCommandType, void> {
  constructor(
    private readonly authApi: IAuthApiService,
    private readonly sessionStore: ISessionStoreService,
  ) {}

  async execute(cmd: ChangePasswordCommandType): Promise<ResultType<void>> {
    const changed = await this.authApi.changePassword(cmd);
    if (!changed.ok) return changed;
    return this.sessionStore.clear();
  }
}
