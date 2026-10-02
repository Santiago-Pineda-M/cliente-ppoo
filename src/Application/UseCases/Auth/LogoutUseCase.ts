import type { IUseCase, ResultType } from '@/Domain';
import type { ISessionStoreService } from '@/Application/Services/ISessionStoreService';

export class LogoutUseCase implements IUseCase<undefined, void> {
  constructor(private readonly sessionStore: ISessionStoreService) {}

  async execute(_input: undefined): Promise<ResultType<void>> {
    const cleared = this.sessionStore.clear();
    if (!cleared.ok) return cleared;
    return { ok: true, value: undefined };
  }
}
