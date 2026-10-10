import { Ploc, initialUsersState, type IUsersState } from '@/Domain';
import type { GetCurrentUserUseCase } from '@/Application/UseCases/Auth/CurrentUser/GetCurrentUserUseCase';
import type {
  ChangeUserPasswordUseCase,
  RegenerateApiKeyUseCase,
} from '@/Application/UseCases/Users/UsersUseCases';
import type { BootstrapAdminUseCase } from '@/Application/UseCases/Bootstrap/BootstrapAdminUseCase';

function generalError(message: string): { general: string[] } {
  return { general: [message] };
}

// La API responde 409 (o 4xx con mensaje de sistema ya inicializado) cuando
// POST /bootstrap/admin se invoca más de una vez. Es un estado esperado,
// no un error: la UI muestra "ya fue inicializado" en vez de una alerta.
const ALREADY_BOOTSTRAPPED_PATTERN = /inicializ|already|ya (fue|existe|se)|existe|duplicad|conflict/i;

function isAlreadyBootstrapped(status: number | undefined, message: string): boolean {
  // La API responde 403 + "bootstrap.disabled" cuando ya existe una persona;
  // 409 queda como respaldo por compatibilidad.
  if (status === 409 || status === 403) return true;
  return status !== undefined && status >= 400 && status < 500 && ALREADY_BOOTSTRAPPED_PATTERN.test(message);
}

export class UsersPloc extends Ploc<IUsersState> {
  constructor(
    private readonly getCurrentUserUC: GetCurrentUserUseCase,
    private readonly changeUserPasswordUC: ChangeUserPasswordUseCase,
    private readonly regenerateApiKeyUC: RegenerateApiKeyUseCase,
    private readonly bootstrapAdminUC: BootstrapAdminUseCase,
  ) {
    super(initialUsersState);
  }

  updateField<K extends keyof IUsersState['formData']>(field: K, value: string): void {
    this.changeState({ ...this.state, formData: { ...this.state.formData, [field]: value }, errors: {} });
  }

  async loadCurrentUser(): Promise<void> {
    this.changeState({ ...this.state, isLoading: true, errors: {} });
    const res = await this.getCurrentUserUC.execute(undefined);
    if (!res.ok) {
      this.changeState({ ...this.state, isLoading: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, isLoading: false, currentUser: res.value });
  }

  // submit() sin parámetros: cambia la clave del login en formData (admin).
  async submit(): Promise<void> {
    const { login, newPassword } = this.state.formData;
    this.changeState({ ...this.state, isLoading: true, errors: {} });
    const res = await this.changeUserPasswordUC.execute({ login: login.trim(), newPassword });
    if (!res.ok) {
      this.changeState({ ...this.state, isLoading: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, isLoading: false, formData: { ...this.state.formData, newPassword: '' } });
  }

  async regenerateKey(): Promise<void> {
    const login = this.state.formData.login.trim();
    this.changeState({ ...this.state, isLoading: true, errors: {} });
    const res = await this.regenerateApiKeyUC.execute({ login });
    if (!res.ok) {
      this.changeState({ ...this.state, isLoading: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, isLoading: false, regeneratedKey: res.value });
  }

  async bootstrap(): Promise<void> {
    this.changeState({ ...this.state, isLoading: true, errors: {} });
    const res = await this.bootstrapAdminUC.execute(undefined);
    if (!res.ok) {
      if (isAlreadyBootstrapped(res.error.status, res.error.message)) {
        this.changeState({ ...this.state, isLoading: false, alreadyBootstrapped: true });
        return;
      }
      this.changeState({ ...this.state, isLoading: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, isLoading: false, bootstrap: res.value });
  }

  reset(): void {
    this.changeState(initialUsersState);
  }
}
