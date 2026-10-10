import type { IUseCase, ResultType } from '@/Domain';
import { SessionEntity } from '@/Domain/Entities/SessionEntity';
import type { IAuthApiService, LoginCommandType } from '@/Application/Services/IAuthApiService';
import type { IUserProfileApiService } from '@/Application/Services/IUserProfileApiService';
import type { ISessionStoreService } from '@/Application/Services/ISessionStoreService';

// Login en dos pasos: el par de tokens no trae usuario,
// así que se obtiene el perfil con las credenciales recién emitidas.
export class LoginUseCase implements IUseCase<LoginCommandType, SessionEntity> {
  constructor(
    private readonly authApi: IAuthApiService,
    private readonly profileApi: IUserProfileApiService,
    private readonly sessionStore: ISessionStoreService,
  ) {}

  async execute(cmd: LoginCommandType): Promise<ResultType<SessionEntity>> {
    const pair = await this.authApi.login({ login: cmd.login.trim(), password: cmd.password });
    if (!pair.ok) return pair;
    const me = await this.profileApi.getCurrentUser({
      access: pair.value.accessToken,
      apiKey: pair.value.apiKey,
    });
    if (!me.ok) return me;
    const session = SessionEntity.create({
      accessToken: pair.value.accessToken,
      refreshToken: pair.value.refreshToken,
      apiKey: pair.value.apiKey,
      expiresAt: pair.value.expiresAt,
      user: me.value,
    });
    if (!session.ok) return session;
    const saved = this.sessionStore.save(session.value);
    if (!saved.ok) return saved;
    return session;
  }
}
