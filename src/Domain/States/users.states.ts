// Estados UI - Cuenta y administración (perfil, bootstrap, API keys).

import type { SessionUserType } from '@/Domain/Entities/SessionEntity';
import type { BootstrapAdminResultType, RegeneratedApiKeyType } from '@/Domain/account';
import type { IPlocState } from './base.states';

export interface IUsersState extends IPlocState {
  currentUser: SessionUserType | null;
  bootstrap: BootstrapAdminResultType | null;
  alreadyBootstrapped: boolean;
  regeneratedKey: RegeneratedApiKeyType | null;
  formData: { login: string; newPassword: string };
}

export const initialUsersState: IUsersState = {
  currentUser: null,
  bootstrap: null,
  alreadyBootstrapped: false,
  regeneratedKey: null,
  formData: { login: '', newPassword: '' },
  isLoading: false,
  errors: {},
};
