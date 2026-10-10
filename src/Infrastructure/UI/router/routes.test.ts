import { describe, expect, it } from 'vitest';
import {
  ROUTES,
  ROUTE_POLICIES,
  getRouteFromHash,
  redirectFor,
  resolveView,
  routeToHash,
  type RoutePolicyType,
  type AppRouteType,
} from './routes';

describe('getRouteFromHash', () => {
  it('resuelve cada hash a su ruta y la raíz/desconocido a home', () => {
    expect(getRouteFromHash('')).toBe('home');
    expect(getRouteFromHash('#/')).toBe('home');
    expect(getRouteFromHash('#/login')).toBe('login');
    expect(getRouteFromHash('#/bootstrap')).toBe('bootstrap');
    expect(getRouteFromHash('#/rara')).toBe('home');
  });
});

describe('routeToHash', () => {
  it('genera la URL canónica de la tabla', () => {
    expect(routeToHash('home')).toBe(ROUTES.home.hash);
    expect(routeToHash('login')).toBe(ROUTES.login.hash);
    expect(routeToHash('bootstrap')).toBe(ROUTES.bootstrap.hash);
  });
});

describe('resolveView', () => {
  it('con sesión el login (guest) no es accesible: manda al home', () => {
    expect(resolveView('login', true)).toBe('home');
    expect(resolveView('home', true)).toBe('home');
  });

  it('con sesión las rutas públicas se muestran', () => {
    expect(resolveView('bootstrap', true)).toBe('bootstrap');
  });

  it('sin sesión respeta login y bootstrap, y home cae a login', () => {
    expect(resolveView('login', false)).toBe('login');
    expect(resolveView('bootstrap', false)).toBe('bootstrap');
    expect(resolveView('home', false)).toBe('login');
  });

  it('toda ruta declara su política', () => {
    expect(Object.keys(ROUTE_POLICIES).sort()).toEqual(['bootstrap', 'home', 'login']);
  });

  it('una futura ruta auth queda protegida sin tocar componentes', () => {
    const policies: Record<AppRouteType, RoutePolicyType> = { ...ROUTE_POLICIES, bootstrap: 'auth' };
    expect(resolveView('bootstrap', false, policies)).toBe('login');
    expect(resolveView('bootstrap', true, policies)).toBe('bootstrap');
  });
});

describe('redirectFor', () => {
  it('normaliza el hash no canónico a su ruta', () => {
    expect(redirectFor('home', '', false)).toBe('login');
    expect(redirectFor('home', '#/rara', false)).toBe('login');
    expect(redirectFor('home', '#/', true)).toBeNull();
  });

  it('no redirige con hash canónico y vista accesible', () => {
    expect(redirectFor('login', '#/login', false)).toBeNull();
    expect(redirectFor('bootstrap', '#/bootstrap', false)).toBeNull();
    expect(redirectFor('bootstrap', '#/bootstrap', true)).toBeNull();
  });

  it('con sesión saca del login hacia home', () => {
    expect(redirectFor('login', '#/login', true)).toBe('home');
    expect(redirectFor('bootstrap', '', true)).toBe('bootstrap');
  });

  it('sin sesión saca de rutas auth hacia login', () => {
    const policies: Record<AppRouteType, RoutePolicyType> = { ...ROUTE_POLICIES, bootstrap: 'auth' };
    expect(redirectFor('bootstrap', '#/bootstrap', false, policies)).toBe('login');
  });
});
