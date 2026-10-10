import { describe, expect, it } from 'vitest';
import { UsersPloc } from './UsersPloc';
import type { BootstrapAdminUseCase } from '@/Application/UseCases/Bootstrap/BootstrapAdminUseCase';
import type { GetCurrentUserUseCase } from '@/Application/UseCases/Auth/CurrentUser/GetCurrentUserUseCase';
import type {
  ChangeUserPasswordUseCase,
  RegenerateApiKeyUseCase,
} from '@/Application/UseCases/Users/UsersUseCases';
import type { BootstrapAdminResultType } from '@/Domain/account';
import type { ApiErrorType } from '@/Domain';

type BootstrapExecute = BootstrapAdminUseCase['execute'];

function makePloc(execute: BootstrapExecute): UsersPloc {
  const bootstrapUC = { execute } as unknown as BootstrapAdminUseCase;
  const stub = { execute: async () => ({ ok: true, value: undefined }) };
  return new UsersPloc(
    stub as unknown as GetCurrentUserUseCase,
    stub as unknown as ChangeUserPasswordUseCase,
    stub as unknown as RegenerateApiKeyUseCase,
    bootstrapUC,
  );
}

const created: BootstrapAdminResultType = {
  personaId: 'p1',
  login: 'admin',
  passwordGenerada: 'gen-123',
  apiKey: 'key-abc',
};

function httpErr(status: number, message: string): { ok: false; error: ApiErrorType } {
  return { ok: false, error: { kind: 'http', status, message } };
}

describe('UsersPloc.bootstrap', () => {
  it('guarda las credenciales generadas al crear el admin', async () => {
    const ploc = makePloc(async () => ({ ok: true, value: created }));
    await ploc.bootstrap();
    expect(ploc.state.isLoading).toBe(false);
    expect(ploc.state.bootstrap).toEqual(created);
    expect(ploc.state.alreadyBootstrapped).toBe(false);
    expect(ploc.state.errors).toEqual({});
  });

  it('marca ya-inicializado ante 409 sin mostrar error', async () => {
    const ploc = makePloc(async () => httpErr(409, 'Conflict'));
    await ploc.bootstrap();
    expect(ploc.state.isLoading).toBe(false);
    expect(ploc.state.alreadyBootstrapped).toBe(true);
    expect(ploc.state.bootstrap).toBeNull();
    expect(ploc.state.errors).toEqual({});
  });

  it('marca ya-inicializado ante 403 bootstrap.disabled de la API', async () => {
    const ploc = makePloc(async () => httpErr(403, 'El sistema ya tiene un administrador inicializado.'));
    await ploc.bootstrap();
    expect(ploc.state.alreadyBootstrapped).toBe(true);
    expect(ploc.state.errors).toEqual({});
  });

  it('marca ya-inicializado ante 400 con mensaje de sistema existente', async () => {
    const ploc = makePloc(async () => httpErr(400, 'El sistema ya fue inicializado'));
    await ploc.bootstrap();
    expect(ploc.state.alreadyBootstrapped).toBe(true);
    expect(ploc.state.errors).toEqual({});
  });

  it('muestra error general ante fallos no relacionados', async () => {
    const ploc = makePloc(async () => httpErr(500, 'Error interno'));
    await ploc.bootstrap();
    expect(ploc.state.alreadyBootstrapped).toBe(false);
    expect(ploc.state.bootstrap).toBeNull();
    expect(ploc.state.errors).toEqual({ general: ['Error interno'] });
  });
});
