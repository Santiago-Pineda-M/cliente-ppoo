import type { IUseCase, ResultType } from '@/Domain';
import type { SessionEntity } from '@/Domain/Entities/SessionEntity';
import type { IAuthApiService, LoginCommandType } from '@/Application/Services/IAuthApiService';
import type { ISessionStoreService } from '@/Application/Services/ISessionStoreService';

export class LoginUseCase implements IUseCase<LoginCommandType, SessionEntity> {
  constructor(
    private readonly authApi: IAuthApiService,
    private readonly sessionStore: ISessionStoreService,
  ) {}

  async execute(cmd: LoginCommandType): Promise<ResultType<SessionEntity>> {
    const logged = await this.authApi.login(cmd);
    if (!logged.ok) return logged;
    const saved = this.sessionStore.save(logged.value);
    if (!saved.ok) return saved;
    return logged;
  }
}
