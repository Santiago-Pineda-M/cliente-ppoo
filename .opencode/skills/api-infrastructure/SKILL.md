---
name: api-infrastructure
description: Patrón de Infrastructure API para el cliente (fetch nativo + wrapper, servicios API por entidad, DI, hooks). Usa cuando se cree o revise ApiClient, XxxApiService, DI/modules, DependenciesProvider o UI que consume PLOCs.
---

# Infrastructure API — Cliente (fetch nativo)

Toda la comunicación HTTP vive en `src/Infrastructure`. Ninguna otra capa
usa `fetch`, `Request`, `Response`, `localStorage` ni `VITE_*`.
NO hay repositorios: el acceso a datos es vía servicios API por entidad.

## ApiClient (único lugar con fetch)

Ubicación: `src/Infrastructure/Api/ApiClient.ts`.

```ts
export type ApiErrorType = { kind: 'http' | 'network' | 'parse' | 'auth'; status?: number; message: string; fields?: Record<string, string[]> };
export class ApiClient {
  constructor(private baseUrl: string) {}
  setAuthHeaderProvider(p: AuthHeaderProviderType | null): void;
  setUnauthorizedHandler(h: UnauthorizedHandlerType | null): void;
  setTraceSink(s: TraceSinkType | null): void;
  async request<T>(path: string, init?: RequestInit, opts?: ApiRequestOptionsType): Promise<ResultType<T, ApiErrorType>>;
}
```

Reglas:

- `baseUrl` desde `import.meta.env.VITE_API_URL` leído SOLO en
  `DI/modules/api.module.ts` (nunca `import.meta.env` en Domain/Application/
  Controllers/UI).
- `request<T>`: añade `Content-Type: application/json`, `Authorization` si hay
  sesión, `X-API-Key` si hay key; `opts.auth === false` omite auth y refresh
  (rutas públicas `/auth/*`). Parsea JSON de forma segura (`unknown` antes de
  castear a `T`); mapea: HTTP no-2xx -> `{ kind: 'http', status }`, fallo red ->
  `{ kind: 'network' }`, `401/403` -> `{ kind: 'auth' }`, JSON inválido ->
  `{ kind: 'parse' }`.
- 401 con sesión: invoca el `UnauthorizedHandlerType` **una vez por petición**
  (reintento único). La concurrencia (varias 401 a la vez = un solo refresh)
  se resuelve con promesa compartida single-flight dentro del cliente.
- Trazas: mide duración y emite `HttpTraceInputType` al sink en cada petición
  (éxito y error). Enmascara `Authorization`/`X-API-Key` antes de emitir.
- Sin lógica de dominio: no construye Entities, no conoce rutas de negocio
  (recibe `path` del `XxxApiService`). Métodos finos: `get/post/put/patch/del<T>()`
  delegando en `request<T>`.
- Sin singletons globales: instancia creada en `DI/modules/api.module.ts`
  (lazy). Providers/handlers/sink se registran vía setters desde sus módulos
  (evita imports circulares: `ApiClient` no importa Application ni Controllers).

## Servicios API por entidad (dueños de la ruta)

- Port en `Application/Services/I<Xxx>ApiService.ts`:
  `list|getById|create|update|remove` (solo lo que exponga la API REST;
  no inventar operaciones que el backend no tiene), retornando `ResultType`.
- Impl en `Infrastructure/Api/<Entidad>/XxxApiService.ts`:
  `class XxxApiService implements I<Xxx>ApiService` con `basePath` único
  (ej `'/usuarios'`). Un servicio por entidad/recurso. La ruta se escribe
  UNA vez; si versiona (`/v1` -> `/v2`), cambia una línea.
- Cada método: llama `api.get/post/...`, recibe `unknown`/DTO JSON, convierte
  con `XxxEntity.fromPersistence()` (que retorna `ResultType`), propaga `err`
  sin throw. Serializa con `entity.toProps()` (Date -> ISO string) al enviar.
- DTOs como `type XxxDtoType` junto al servicio o al port. No crear capa
  `mappers/` separada salvo que 2+ servicios compartan el mismo DTO.

## Servicios con IO no-HTTP + storage

- Implementaciones con IO de `I<Xxx>Service` (ports en
  `Application/Services/`) viven en `Infrastructure/Services/XxxService.ts`.
- Sesión/auth en `localStorage`: SOLO vía `SessionStoreService`
  (`Infrastructure/Services/`). Ninguna otra capa toca `localStorage`.
  Tokens y API key nunca llegan al estado React ni a las trazas (enmascarados).

## DI + Hooks + UI

```
DI/modules/xxx.module.ts (lazy singletons: api -> xxxApiService -> useCases/services -> plocs)
  -> DI/DependenciesLocator.ts (interface IDependencies + getters)
  -> Context/DependenciesProvider.tsx (createContext + useDependencies())
  -> Hooks/usePlocState.ts (subscribe/unsubscribe)
  -> UI/pages|components (useDependencies + usePlocState + useEffect load/reset)
```

- `DI/modules/api.module.ts`: `getApiClient()` (lee env una vez).
- `DI/modules/xxx.module.ts`: `getXxxApiService()`, `getXxxUseCase(s)()`,
  `getXxxService()`, `getXxxListPloc()` etc. Único lugar con `new`.
- `usePlocState<S>(ploc: Ploc<S>): S`: `useState(ploc.state)` +
  `useEffect subscribe/unsubscribe`.
- UI nunca importa `ApiClient`, `XxxApiService` ni UseCases/Services con IO.
  Solo `useDependencies()` + `usePlocState()` + tipos `*Type` de `States/`.

## Rechazar en revisión

- Cualquier `XxxRepository` (no existen en este proyecto).
- Rutas/URLs fuera de `Infrastructure/Api/<Entidad>/`.
- `fetch`/`axios`/`XMLHttpRequest` fuera de `Api/`.
- `import.meta.env` fuera de `DI/modules/api.module.ts`.
- `localStorage` fuera de `Infrastructure/Services/`.
- Token/auth leído en UI o Controllers (viene del provider inyectado).
- Servicio que retorna Entities sin validar (`fromPersistence` debe chequearse).
- Servicio que hace `throw` (debe retornar `ResultType` err).
- `type` sin sufijo `Type`, interfaz de contrato sin prefijo `I`.
