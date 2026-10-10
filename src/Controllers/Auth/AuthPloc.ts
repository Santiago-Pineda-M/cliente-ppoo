import { Ploc, initialAuthState, type IAuthState } from '@/Domain';
import type { ISessionStoreService } from '@/Application/Services/ISessionStoreService';
import type { LoginUseCase } from '@/Application/UseCases/Auth/LoginUseCase';
import type { RefreshSessionUseCase } from '@/Application/UseCases/Auth/RefreshSessionUseCase';
import type { LogoutUseCase } from '@/Application/UseCases/Auth/LogoutUseCase';
import type { ChangePasswordUseCase } from '@/Application/UseCases/Auth/ChangePassword/ChangePasswordUseCase';
import type { RevokeTokenUseCase } from '@/Application/UseCases/Auth/RevokeToken/RevokeTokenUseCase';

function generalError(message: string): { general: string[] } {
  return { general: [message] };
}

export class AuthPloc extends Ploc<IAuthState> {
  constructor(
    private readonly loginUC: LoginUseCase,
    private readonly refreshUC: RefreshSessionUseCase,
    private readonly logoutUC: LogoutUseCase,
    private readonly changePasswordUC: ChangePasswordUseCase,
    private readonly revokeTokenUC: RevokeTokenUseCase,
    private readonly sessionStore: ISessionStoreService,
  ) {
    super(initialAuthState);
  }

  updateField<K extends keyof IAuthState['formData']>(field: K, value: string): void {
    this.changeState({ ...this.state, formData: { ...this.state.formData, [field]: value }, errors: {} });
  }

  updatePasswordField<K extends keyof IAuthState['passwordForm']>(field: K, value: string): void {
    this.changeState({ ...this.state, passwordForm: { ...this.state.passwordForm, [field]: value }, errors: {} });
  }

  // submit() sin parámetros: lee this.state.formData.
  async submit(): Promise<void> {
    const { login, password } = this.state.formData;
    this.changeState({ ...this.state, isSubmitting: true, errors: {} });
    const res = await this.loginUC.execute({ login: login.trim(), password });
    if (!res.ok) {
      this.changeState({ ...this.state, isSubmitting: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({
      ...initialAuthState,
      user: res.value.user,
      isAuthenticated: true,
    });
  }

  async logout(): Promise<void> {
    await this.logoutUC.execute(undefined);
    this.changeState(initialAuthState);
  }

  // Cambio de contraseña propio: la API invalida el access,
  // así que al éxito se vuelve al estado inicial (re-login).
  async changePassword(): Promise<void> {
    const { currentPassword, newPassword } = this.state.passwordForm;
    this.changeState({ ...this.state, isSubmitting: true, errors: {} });
    const res = await this.changePasswordUC.execute({ currentPassword, newPassword });
    if (!res.ok) {
      this.changeState({ ...this.state, isSubmitting: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState(initialAuthState);
  }

  // Revoca el refresh en el servidor (la sesión local sigue hasta logout/refresh).
  async revokeRefreshToken(): Promise<void> {
    const stored = this.sessionStore.load();
    if (!stored.ok || !stored.value) {
      this.changeState({ ...this.state, errors: generalError('Sin sesión guardada') });
      return;
    }
    const res = await this.revokeTokenUC.execute({
      personaId: stored.value.user.id,
      refreshToken: stored.value.refreshToken,
    });
    if (!res.ok) {
      this.changeState({ ...this.state, errors: generalError(res.error.message) });
    }
  }

  // Restaurar sesión al arrancar (si hay refresh guardado, renueva el access).
  async checkSession(): Promise<void> {
    this.changeState({ ...this.state, isLoading: true, errors: {} });
    const stored = this.sessionStore.load();
    if (!stored.ok || !stored.value) {
      this.changeState({ ...initialAuthState, isLoading: false });
      return;
    }
    if (!stored.value.isExpired()) {
      this.changeState({
        ...initialAuthState,
        isLoading: false,
        user: stored.value.user,
        isAuthenticated: true,
      });
      return;
    }
    const refreshed = await this.refreshUC.execute(undefined);
    if (!refreshed.ok) {
      await this.logoutUC.execute(undefined);
      this.changeState({ ...initialAuthState, isLoading: false });
      return;
    }
    this.changeState({
      ...initialAuthState,
      isLoading: false,
      user: refreshed.value.user,
      isAuthenticated: true,
    });
  }

  reset(): void {
    this.changeState(initialAuthState);
  }
}
