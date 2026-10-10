// Registro de rutas (fuente única). La protección vive AQUÍ, no en componentes:
// cada ruta declara su política y estas funciones puras deciden la vista
// efectiva y la redirección. La seguridad real la aplica la API (401/403);
// el router solo decide QUÉ mostrar y a DÓNDE mandar si una ruta no es accesible.
//
// Rutas actuales: home (privada, sesión) · login (invitados) · bootstrap (pública).
// Las pantallas de negocio futuras se agregan aquí con política 'auth' y quedan
// protegidas automáticamente, sin tocar componentes.
export type AppRouteType = 'home' | 'login' | 'bootstrap';

// guest = rebota a home con sesión · public = siempre visible · auth = solo con sesión.
export type RoutePolicyType = 'guest' | 'public' | 'auth';

export type ResolvedViewType = 'home' | AppRouteType;

export interface RouteDefinitionType {
  hash: string;
  policy: RoutePolicyType;
}

export const ROUTES: Record<AppRouteType, RouteDefinitionType> = {
  home: { hash: '#/', policy: 'auth' },
  login: { hash: '#/login', policy: 'guest' },
  bootstrap: { hash: '#/bootstrap', policy: 'public' },
};

export const ROUTE_POLICIES: Record<AppRouteType, RoutePolicyType> = {
  home: ROUTES.home.policy,
  login: ROUTES.login.policy,
  bootstrap: ROUTES.bootstrap.policy,
};

export function getRouteFromHash(hash: string): AppRouteType {
  const clean = hash.replace(/^#/, '').split('?')[0];
  if (clean === '/bootstrap' || clean === 'bootstrap' || clean === '/bootstrap/') return 'bootstrap';
  if (clean === '/login' || clean === 'login' || clean === '/login/') return 'login';
  return 'home';
}

export function routeToHash(route: AppRouteType): string {
  return ROUTES[route].hash;
}

export function navigateTo(route: AppRouteType): void {
  window.location.hash = routeToHash(route);
}

// Vista efectiva según sesión y política:
// - con sesión: las rutas 'guest' (login) no son accesibles -> home.
// - sin sesión: las rutas 'auth' (home y futuras privadas) -> login.
export function resolveView(
  route: AppRouteType,
  isAuthenticated: boolean,
  policies: Record<AppRouteType, RoutePolicyType> = ROUTE_POLICIES,
): ResolvedViewType {
  if (isAuthenticated) return policies[route] === 'guest' ? 'home' : route;
  if (policies[route] === 'auth') return 'login';
  return route;
}

// ¿A dónde redirigir? null = quedarse. Cubre:
// - ruta 'guest' con sesión (login ya autenticado -> home).
// - ruta 'auth' sin sesión (home anónimo -> login).
// - hash no canónico ('' o desconocido -> hash de la ruta resuelta).
export function redirectFor(
  route: AppRouteType,
  rawHash: string,
  isAuthenticated: boolean,
  policies: Record<AppRouteType, RoutePolicyType> = ROUTE_POLICIES,
): AppRouteType | null {
  const view = resolveView(route, isAuthenticated, policies);
  if (rawHash !== ROUTES[view].hash) return view;
  return null;
}
