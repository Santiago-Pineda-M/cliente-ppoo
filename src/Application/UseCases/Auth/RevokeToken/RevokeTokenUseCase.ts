import type { IUseCase, ResultType } from '@/Domain';
import type { IAuthApiService, RevokeTokenCommandType } from '@/Application/Services/IAuthApiService';

export class RevokeTokenUseCase implements IUseCase<RevokeTokenCommandType, void> {
  constructor(private readonly authApi: IAuthApiService) {}

  async execute(cmd: RevokeTokenCommandType): Promise<ResultType<void>> {
    return this.authApi.revokeToken(cmd);
  }
}
