---
name: api-infrastructure
description: Patrón de Infrastructure API para el cliente (fetch nativo + wrapper, repositorios API, DI, hooks). Usa cuando se cree o revise ApiClient, XxxApiRepository, DI/modules, DependenciesProvider o UI que consume PLOCs.
---

# Infrastructure API — Cliente (fetch nativo)

Toda la comunicación HTTP vive en `src/Infrastructure`. Ninguna otra capa
usa `fetch`, `Request`, `Response`, `localStorage` ni `VITE_*`.

## ApiClient (único lugar con fetch)

Ubicación: `src/Infrastructure/Api/ApiClient.ts`.

```ts
export type ApiErrorType = { kind: 'http' | 'network' | 'parse' | 'auth'; status?: number; message: string; fields?: Record<string, string[]> };
export class ApiClient {
  constructor(private baseUrl: string, private tokenProvider?: () => string | null) {}
  async request<T>(path: string, init?: RequestInit): Promise<ResultType<T, ApiErrorType>>;
}
```

Reglas:

- `baseUrl` desde `import.meta.env.VITE_API_URL` leído SOLO aquí (o inyectado
  por constructor desde DI). Nunca `import.meta.env` en Domain/Application/
  Controllers/UI.
- `request<T>`: añade `Content-Type: application/json`, `Authorization` si hay
  token, parsea JSON de forma segura (`unknown` -> validación mínima antes de
  castear a `T`), mapea: HTTP no-2xx -> `{ kind: 'http', status }`, fallo red ->
  `{ kind: 'network' }`, `401/403` -> `{ kind: 'auth' }`, JSON inválido ->
  `{ kind: 'parse' }`.
- Sin lógica de dominio: no construye Entities, no conoce rutas de negocio
  (recibe `path` del repositorio). Métodos finos: `get/post/put/patch/del<T>()`
  delegando en `request<T>`.
- Sin singletons globales: instancia creada en `DI/modules/api.module.ts`
  (lazy) e inyectada a los repositorios.

## Repositorios y servicios con IO

- Port en `Domain/Repositories/IXxxRepository.ts`:
  `save|findById|findAll|delete|count` (adaptar a lo que exponga la API;
  no inventar operaciones que el backend no tiene).
- Impl en `Infrastructure/Repositories/XxxApiRepository.ts`:
  `class XxxApiRepository implements IXxxRepository`.
- Cada método: llama `api.get/post/...`, recibe `unknown`/DTO JSON, convierte
  con `XxxEntity.fromPersistence()` (que retorna `ResultType`), propaga `err` sin
  throw. Serializa con `entity.toProps()` (Date -> ISO string) al enviar.
- Mapper JSON<->Entity vive como `fromPersistence/toProps` de la entidad o
  función privada `toEntity()` del repo. No crear capa `mappers/` separada
  salvo que 2+ repos compartan el mismo DTO.
- Implementaciones con IO de `I<Xxx>Service` (ports en
  `Application/Services/`) viven en `Infrastructure/Services/XxxService.ts`.

## DI + Hooks + UI

```
DI/modules/xxx.module.ts (lazy singletons: api -> repo -> useCases/services -> plocs)
  -> DI/DependenciesLocator.ts (interface IDependencies + getters)
  -> Context/DependenciesProvider.tsx (createContext + useDependencies())
  -> Hooks/usePlocState.ts (subscribe/unsubscribe)
  -> UI/pages|components (useDependencies + usePlocState + useEffect load/reset)
```

- `DI/modules/api.module.ts`: `getApiClient()` (lee env una vez).
- `DI/modules/xxx.module.ts`: `getXxxRepo()`, `getXxxUseCase(s)()`,
  `getXxxService()`, `getXxxListPloc()` etc. Único lugar con `new`.
- `usePlocState<S>(ploc: Ploc<S>): S`: `useState(ploc.state)` +
  `useEffect subscribe/unsubscribe`.
- UI nunca importa `ApiClient`, `XxxApiRepository` ni UseCases/Services con IO.
  Solo `useDependencies()` + `usePlocState()` + tipos `*Type` de `States/`.

## Rechazar en revisión

- `fetch`/`axios`/`XMLHttpRequest` fuera de `Api/`.
- `import.meta.env` fuera de `DI/modules/api.module.ts` o `Api/ApiClient.ts`.
- Token/auth leído en UI o Controllers (debe venir de `tokenProvider`
  inyectado en `ApiClient`).
- Repo que retorna Entities sin validar (`fromPersistence` debe chequearse).
- Repo que hace `throw` (debe retornar `ResultType` err).
- `type` sin sufijo `Type`, interfaz de contrato sin prefijo `I`.
