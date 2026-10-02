// Estados UI - Autenticación.

import type { SessionUserType } from '@/Domain/Entities/SessionEntity';
import type { IPlocState } from './base.states';

export interface IAuthState extends IPlocState {
  user: SessionUserType | null;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  formData: { identifier: string; password: string };
}

export const initialAuthState: IAuthState = {
  user: null,
  isAuthenticated: false,
  isSubmitting: false,
  formData: { identifier: '', password: '' },
  isLoading: false,
  errors: {},
};
