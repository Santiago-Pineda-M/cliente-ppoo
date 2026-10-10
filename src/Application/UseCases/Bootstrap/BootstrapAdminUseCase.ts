import type { IUseCase, ResultType } from '@/Domain';
import type { BootstrapAdminResultType, IBootstrapApiService } from '@/Application/Services/IBootstrapApiService';

export class BootstrapAdminUseCase implements IUseCase<undefined, BootstrapAdminResultType> {
  constructor(private readonly bootstrapApi: IBootstrapApiService) {}

  async execute(_input: undefined): Promise<ResultType<BootstrapAdminResultType>> {
    return this.bootstrapApi.createAdmin();
  }
}
