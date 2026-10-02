import {
  Ploc,
  initialAuthState,
  type IAuthState,
} from '@/Domain';
import type {
  LoginUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  ISessionStoreService,
} from '@/Application';

export class AuthPloc extends Ploc<IAuthState> {
  constructor(
    private readonly loginUC: LoginUseCase,
    private readonly refreshUC: RefreshSessionUseCase,
    private readonly logoutUC: LogoutUseCase,
    private readonly sessionStore: ISessionStoreService,
  ) {
    super(initialAuthState);
  }

  updateField<K extends keyof IAuthState['formData']>(field: K, value: string): void {
    this.changeState({ ...this.state, formData: { ...this.state.formData, [field]: value }, errors: {} });
  }

  // submit() sin parámetros: lee this.state.formData.
  async submit(): Promise<void> {
    const { identifier, password } = this.state.formData;
    this.changeState({ ...this.state, isSubmitting: true, errors: {} });
    const res = await this.loginUC.execute({ identifier: identifier.trim(), password });
    if (!res.ok) {
      this.changeState({ ...this.state, isSubmitting: false, errors: { general: [res.error.message] } });
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
