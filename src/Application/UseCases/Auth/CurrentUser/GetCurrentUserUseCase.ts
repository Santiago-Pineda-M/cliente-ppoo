import type { IUseCase, ResultType } from '@/Domain';
import type { SessionUserType } from '@/Domain/Entities/SessionEntity';
import type { IUserProfileApiService } from '@/Application/Services/IUserProfileApiService';

export class GetCurrentUserUseCase implements IUseCase<undefined, SessionUserType> {
  constructor(private readonly profileApi: IUserProfileApiService) {}

  async execute(_input: undefined): Promise<ResultType<SessionUserType>> {
    return this.profileApi.getCurrentUser();
  }
}
