// Módulo cuenta: profile (/users) + usuarios (/usuarios) + bootstrap -> UCs -> UsersPloc.
import type { IUserProfileApiService } from '@/Application/Services/IUserProfileApiService';
import type { IUsuariosApiService } from '@/Application/Services/IUsuariosApiService';
import type { IBootstrapApiService } from '@/Application/Services/IBootstrapApiService';
import { GetCurrentUserUseCase } from '@/Application/UseCases/Auth/CurrentUser/GetCurrentUserUseCase';
import {
  ChangeUserPasswordUseCase,
  RegenerateApiKeyUseCase,
} from '@/Application/UseCases/Users/UsersUseCases';
import { BootstrapAdminUseCase } from '@/Application/UseCases/Bootstrap/BootstrapAdminUseCase';
import { UsersPloc } from '@/Controllers/Users/UsersPloc';
import { UserProfileApiService, UsuariosApiService } from '@/Infrastructure/Api/Users/UsersApiService';
import { BootstrapApiService } from '@/Infrastructure/Api/Bootstrap/BootstrapApiService';
import { getApiClient } from './api.module';

let profileApi: IUserProfileApiService | null = null;
export function getUserProfileApiService(): IUserProfileApiService {
  if (!profileApi) profileApi = new UserProfileApiService(getApiClient());
  return profileApi;
}

let usuariosApi: IUsuariosApiService | null = null;
export function getUsuariosApiService(): IUsuariosApiService {
  if (!usuariosApi) usuariosApi = new UsuariosApiService(getApiClient());
  return usuariosApi;
}

let bootstrapApi: IBootstrapApiService | null = null;
export function getBootstrapApiService(): IBootstrapApiService {
  if (!bootstrapApi) bootstrapApi = new BootstrapApiService(getApiClient());
  return bootstrapApi;
}

let getCurrentUserUC: GetCurrentUserUseCase | null = null;
function getGetCurrentUserUseCase(): GetCurrentUserUseCase {
  if (!getCurrentUserUC) getCurrentUserUC = new GetCurrentUserUseCase(getUserProfileApiService());
  return getCurrentUserUC;
}

let changeUserPasswordUC: ChangeUserPasswordUseCase | null = null;
function getChangeUserPasswordUseCase(): ChangeUserPasswordUseCase {
  if (!changeUserPasswordUC) changeUserPasswordUC = new ChangeUserPasswordUseCase(getUsuariosApiService());
  return changeUserPasswordUC;
}

let regenerateApiKeyUC: RegenerateApiKeyUseCase | null = null;
function getRegenerateApiKeyUseCase(): RegenerateApiKeyUseCase {
  if (!regenerateApiKeyUC) regenerateApiKeyUC = new RegenerateApiKeyUseCase(getUsuariosApiService());
  return regenerateApiKeyUC;
}

let bootstrapAdminUC: BootstrapAdminUseCase | null = null;
function getBootstrapAdminUseCase(): BootstrapAdminUseCase {
  if (!bootstrapAdminUC) bootstrapAdminUC = new BootstrapAdminUseCase(getBootstrapApiService());
  return bootstrapAdminUC;
}

let usersPloc: UsersPloc | null = null;
export function getUsersPloc(): UsersPloc {
  if (!usersPloc) {
    usersPloc = new UsersPloc(
      getGetCurrentUserUseCase(),
      getChangeUserPasswordUseCase(),
      getRegenerateApiKeyUseCase(),
      getBootstrapAdminUseCase(),
    );
  }
  return usersPloc;
}
