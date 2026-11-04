// Registro de rutas (fuente única). La protección vive AQUÍ, no en componentes:
// cada ruta declara su política y estas funciones puras deciden la vista
// efectiva y la redirección. La seguridad real la aplica la API (401/403);
// el router solo decide QUÉ mostrar y a DÓNDE mandar si una ruta no es accesible.
//
// Rutas: home (privada) · login (invitados) · bootstrap (pública) · rutas de negocio (privadas).
export type AppRouteType =
  | 'home'
  | 'login'
  | 'bootstrap'
  | 'personas'
  | 'vehiculos'
  | 'conductores'
  | 'consultas'
  | 'tipos-documento'
  | 'usuarios';

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
  personas: { hash: '#/personas', policy: 'auth' },
  vehiculos: { hash: '#/vehiculos', policy: 'auth' },
  conductores: { hash: '#/conductores', policy: 'auth' },
  consultas: { hash: '#/consultas', policy: 'auth' },
  'tipos-documento': { hash: '#/tipos-documento', policy: 'auth' },
  usuarios: { hash: '#/usuarios', policy: 'auth' },
};

export const ROUTE_POLICIES: Record<AppRouteType, RoutePolicyType> = {
  home: ROUTES.home.policy,
  login: ROUTES.login.policy,
  bootstrap: ROUTES.bootstrap.policy,
  personas: ROUTES.personas.policy,
  vehiculos: ROUTES.vehiculos.policy,
  conductores: ROUTES.conductores.policy,
  consultas: ROUTES.consultas.policy,
  'tipos-documento': ROUTES['tipos-documento'].policy,
  usuarios: ROUTES.usuarios.policy,
};

export function getRouteFromHash(hash: string): AppRouteType {
  const clean = hash.replace(/^#/, '').split('?')[0];
  switch (clean) {
    case '/bootstrap':
    case 'bootstrap':
    case '/bootstrap/':
      return 'bootstrap';
    case '/login':
    case 'login':
    case '/login/':
      return 'login';
    case '/personas':
    case 'personas':
    case '/personas/':
      return 'personas';
    case '/vehiculos':
    case 'vehiculos':
    case '/vehiculos/':
      return 'vehiculos';
    case '/conductores':
    case 'conductores':
    case '/conductores/':
      return 'conductores';
    case '/consultas':
    case 'consultas':
    case '/consultas/':
      return 'consultas';
    case '/tipos-documento':
    case 'tipos-documento':
    case '/tipos-documento/':
      return 'tipos-documento';
    case '/usuarios':
    case 'usuarios':
    case '/usuarios/':
      return 'usuarios';
    default:
      return 'home';
  }
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
