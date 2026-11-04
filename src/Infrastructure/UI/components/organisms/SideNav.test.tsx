import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { AuthPloc } from '@/Controllers/Auth/AuthPloc';
import { SideNav } from './SideNav';

const holder = vi.hoisted(() => ({
  ploc: null as unknown as Pick<AuthPloc, 'state' | 'logout'>,
  logout: vi.fn(),
}));

vi.mock('@/Infrastructure/Context/DependenciesProvider', () => ({
  useDependencies: () => ({ authPloc: holder.ploc }),
}));

const authedState = {
  isAuthenticated: true,
  user: { id: '1', login: 'adm', nombres: 'Ada', apellidos: 'Min', role: 'Admin' },
};

const anonState = { isAuthenticated: false, user: null };

function stubPloc(state: typeof authedState | typeof anonState): void {
  holder.ploc = {
    state,
    logout: holder.logout,
    subscribe: () => {},
    unsubscribe: () => {},
  } as unknown as Pick<AuthPloc, 'state' | 'logout'>;
}

beforeEach(() => {
  window.location.hash = '#/';
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('SideNav', () => {
  it('no renderiza sin sesión', () => {
    stubPloc(anonState);
    const { container } = render(<SideNav />);
    expect(container.firstChild).toBeNull();
  });

  it('marca Inicio activo y muestra todos los ítems de negocio con enlace', () => {
    stubPloc(authedState);
    render(<SideNav />);
    expect(screen.getByRole('link', { name: 'Inicio' }).getAttribute('aria-current')).toBe('page');
    expect(screen.queryAllByText('Pronto')).toHaveLength(0);
    expect(screen.getByText('adm')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Personas' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Vehículos' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Conductores' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Consultas' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Tipos de documento' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Usuarios' })).toBeDefined();
  });

  it('cierra sesión desde el pie', () => {
    stubPloc(authedState);
    render(<SideNav />);
    fireEvent.click(screen.getByRole('button', { name: 'Salir' }));
    expect(holder.logout).toHaveBeenCalledOnce();
  });
});
