import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ISessionStoreService } from '@/Application/Services/ISessionStoreService';
import type { LoginUseCase } from '@/Application/UseCases/Auth/LoginUseCase';
import type { RefreshSessionUseCase } from '@/Application/UseCases/Auth/RefreshSessionUseCase';
import type { LogoutUseCase } from '@/Application/UseCases/Auth/LogoutUseCase';
import type { ChangePasswordUseCase } from '@/Application/UseCases/Auth/ChangePassword/ChangePasswordUseCase';
import type { RevokeTokenUseCase } from '@/Application/UseCases/Auth/RevokeToken/RevokeTokenUseCase';
import type { SessionUserType } from '@/Domain/Entities/SessionEntity';
import { AuthPloc } from '@/Controllers/Auth/AuthPloc';
import { LoginForm } from './LoginForm';

const holder = vi.hoisted(() => ({ ploc: null as AuthPloc | null }));

vi.mock('@/Infrastructure/Context/DependenciesProvider', () => ({
  useDependencies: () => ({ authPloc: holder.ploc as AuthPloc }),
}));

const loginUser: SessionUserType = { id: '1', login: 'adm', nombres: 'Ada', apellidos: 'Min', role: 'Admin' };

function makeAuthPloc(): AuthPloc {
  const ok = { ok: true, value: undefined } as const;
  const loginUC = { execute: async () => ({ ok: true, value: { user: loginUser } }) } as unknown as LoginUseCase;
  const refreshUC = { execute: async () => ok } as unknown as RefreshSessionUseCase;
  const logoutUC = { execute: async () => ok } as unknown as LogoutUseCase;
  const changePasswordUC = { execute: async () => ok } as unknown as ChangePasswordUseCase;
  const revokeTokenUC = { execute: async () => ok } as unknown as RevokeTokenUseCase;
  const store = { load: () => ({ ok: true, value: null }) } as unknown as ISessionStoreService;
  return new AuthPloc(loginUC, refreshUC, logoutUC, changePasswordUC, revokeTokenUC, store);
}

beforeEach(() => {
  holder.ploc = makeAuthPloc();
});

afterEach(() => {
  cleanup();
  holder.ploc = null;
});

// Regresión: tras login exitoso la app desmonta LoginForm (muestra el home).
// El cleanup NO debe borrar la sesión recién creada.
describe('LoginForm unmount', () => {
  it('conserva la sesión tras login exitoso y desmontaje', async () => {
    const { unmount } = render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'adm' } });
    fireEvent.change(screen.getByLabelText('Clave'), { target: { value: 'secreta' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(holder.ploc?.state.isAuthenticated).toBe(true));
    expect(holder.ploc?.state.user).toEqual(loginUser);

    unmount();
    expect(holder.ploc?.state.isAuthenticated).toBe(true);
    expect(holder.ploc?.state.user).toEqual(loginUser);
  });

  it('limpia el formulario al salir sin haber entrado', () => {
    const { unmount } = render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'adm' } });
    unmount();
    expect(holder.ploc?.state.isAuthenticated).toBe(false);
    expect(holder.ploc?.state.formData.login).toBe('');
  });
});
