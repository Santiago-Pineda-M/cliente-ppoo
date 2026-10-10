import type { IUseCase, ResultType } from '@/Domain';
import type {
  ChangeUserPasswordCommandType,
  IUsuariosApiService,
  RegenerateApiKeyCommandType,
  RegeneratedApiKeyType,
} from '@/Application/Services/IUsuariosApiService';

export class ChangeUserPasswordUseCase implements IUseCase<ChangeUserPasswordCommandType, void> {
  constructor(private readonly usersApi: IUsuariosApiService) {}

  async execute(cmd: ChangeUserPasswordCommandType): Promise<ResultType<void>> {
    return this.usersApi.changeUserPassword(cmd);
  }
}

export class RegenerateApiKeyUseCase implements IUseCase<RegenerateApiKeyCommandType, RegeneratedApiKeyType> {
  constructor(private readonly usersApi: IUsuariosApiService) {}

  async execute(cmd: RegenerateApiKeyCommandType): Promise<ResultType<RegeneratedApiKeyType>> {
    return this.usersApi.regenerateApiKey(cmd);
  }
}
