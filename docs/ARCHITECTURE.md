# Arquitectura — CLIENTE_PPOO

Cliente web de la API: **React + TypeScript (Vite) + Clean Architecture de 4 capas
+ PLOC**. Solo arquitectura (sin reglas de negocio). Referencia estructural:
proyecto ejemplo con `src/Domain|Application|Controllers|Infrastructure`.

NO hay repositorios: son para persistencia local y aquí no hay. Todo acceso a
datos remotos es vía **servicios API por entidad**.

Para añadir código sigue [`ADDING_FEATURES.md`](ADDING_FEATURES.md); para el
modelo de seguridad, [`SECURITY.md`](SECURITY.md).

## Capas y dirección de dependencias

Estrictamente unidireccional, nunca se invierte:

```
UI (Infrastructure/UI, React)
  └─> src/Controllers   (PLOCs: estado + delegación en use cases/services; PROHIBIDO fetch/storage/router)
        └─> src/Application (UseCases + Services incl. I<Xxx>ApiService; External/ aparte; retornan ResultType)
              └─> src/Domain (TS puro: entidades, VOs, states, Ploc base, ResultType, IUseCase)
src/Infrastructure         (ApiClient fetch, XxxApiService por entidad, services con IO, DI, hooks, UI)
```

- **`src/Domain`** — TS puro, cero imports de otras capas, react o fetch.
  `IPatterns.ts` (`ResultType<T,E>`, `ApiErrorType`, `IUseCase`), `Ploc.ts`
  (`state`, `changeState`, `subscribe`, `unsubscribe`), `Entities/*Entity.ts`,
  `ValueObjects/*`, `States/*` (`XxxItemType` + `IXxxState` + `initialXxxState`).
  SIN `Repositories/` ni `Services/`.
- **`src/Application`** — tres grupos, nunca mezclados:
  - `UseCases/<Agregado>/<Verbo><Agregado>UseCase.ts`. Sin estado, inyecta
    ports de servicios, retorna `Promise<ResultType<Output>>`. **Nunca escribe
    URLs**: consume `I<Xxx>ApiService`. Commands como
    `type XxxCommandType = {...}` junto al UC.
  - `Services/I<Xxx>ApiService.ts`. Ports de datos remotos, un port por
    entidad/recurso REST (`list|getById|create|update|remove` según la API).
  - `Services/I<Xxx>Service.ts`: puertos de servicios de aplicación (p. ej.
    `IHttpTraceService`). La implementación con IO vive en
    `Infrastructure/Services/` (`SessionStoreService`, `HttpTraceService`).
    `Services/External/`: envoltorios de librerías, en carpeta aparte.
- **`src/Controllers`** — `<Agregado>/<Agregado><Rol>Ploc.ts`
  (`List|Detail|CreateForm|EditForm|Delete`). Extiende `Ploc<State>`, expone
  `load/submit/updateField/reset`. Solo importa `Domain` + `type` de
  Application (UC o `I<Xxx>Service`).
- **`src/Infrastructure`** — implementaciones:
  - `Api/ApiClient.ts` (único `fetch`; auth + refresh single-flight + trazas).
  - `Api/<Entidad>/XxxApiService.ts` (`implements I<Xxx>ApiService`, dueño de
    la ruta con `basePath` único, JSON <-> Entity).
  - `Services/XxxService.ts` (IO no-HTTP: `SessionStoreService` con `localStorage`).
  - `DI/modules/*.module.ts` (singletons lazy, único `new`) ->
    `DI/DependenciesLocator.ts` (`IDependencies`) ->
    `Context/DependenciesProvider.tsx` + `useDependencies()`,
    `Hooks/usePlocState.ts`, `UI/pages|components|layouts`.

## PLOC (patrón)

- Estado tipado en `Domain/States/`; base `IPlocState { isLoading;
  errors: Record<string,string[]> }`; DTO plano `XxxItemType` (fechas ISO string,
  nunca Entity en UI) + `initial*State`.
- UC/Service retorna `ResultType`; PLOC bifurca: `ok` => datos, `err` => `errors`.
- `submit()` sin parámetros (usa `this.state.formData`);
  `updateField(field, value)`; `reset()` a `initial*State`.
- UI: `useDependencies() + usePlocState(ploc)` +
  `useEffect(() => { ploc.load(); return () => ploc.reset(); }, [ploc])`.

## Flujo de datos (ejemplo lista, sin repositorios)

```
UI --load()--> XListPloc --execute()--> GetXListUseCase --list()-->
I<Xxx>ApiService --request()--> XxxApiService/ApiClient --> API REST
API --> JSON --> fromPersistence() --> Entity --> toItem() --> XxxItemType
--> changeState({ items }) --> usePlocState --> render
```

## Auth (JWT access+refresh + API key por sesión)

- `SessionEntity` (Domain) + `IAuthApiService` (`login|refresh`) +
  `Login|RefreshSession|LogoutUseCase` + `AuthPloc` (`IAuthState`).
- Sesión en `localStorage` SOLO vía `SessionStoreService`.
- Un solo `ApiClient`: adjunta `Authorization` + `X-API-Key` salvo `auth:false`.
  401 => refresh con cola single-flight => reintento único => si falla, logout.
- Tokens y key enmascarados en trazas y nunca en estado React.

## API relacionada (API_PPOO)

- Ubicación: `../API_PPOO` (hermano de este repo; solución .NET 10 `ApiPoo2.sln`).
- El cliente la consume en `VITE_API_URL` (ver `.env.example`; desarrollo: `http://localhost:5114/api`).
- Arranque local: `dotnet run --project src/ApiPoo2.WebApi --launch-profile http`
  (http `:5114`) desde la raíz de `API_PPOO`. Requiere su `.env` (claves
  `DATABASE_URL`, `Jwt__*`, `Bootstrap__*`, `Cors__AllowedOrigins`).
- Contrato relevante: `POST /api/bootstrap/admin` (siembra única, luego 403
  `bootstrap.disabled`), `POST /api/auth/login` (par de tokens + apiKey),
  errores `application/problem+json` (`status|code|message|errors|traceId`).
- Detalle del servidor (capas, migraciones, tests): `../API_PPOO/ARCHITECTURE.md`.

## Trazas HTTP (drawer colapsable)

- `ApiClient` emite `HttpTraceInputType` al sink (duración incluida).
- `HttpTraceService` (ring buffer 100, enmascara sensibles) + `HttpTraceListPloc`
  (`isOpen|traces|selectedId`, `toggle/select/clear`) + drawer en `MainLayout`.

## Estructuras clave (plantillas)

```ts
// Domain/IPatterns.ts
export type ApiErrorType = { kind: 'http' | 'network' | 'parse' | 'auth'; status?: number; message: string; fields?: Record<string, string[]> };
export type ResultType<T, E = ApiErrorType> = { ok: true; value: T } | { ok: false; error: E };
export interface IUseCase<Input, Output> { execute(input: Input): Promise<ResultType<Output>> }

// Domain/Ploc.ts
export abstract class Ploc<S> {
  private s: S; private ls: ((s: S) => void)[] = [];
  constructor(i: S) { this.s = i } get state(): S { return this.s }
  changeState(n: S) { this.s = n; this.ls.forEach((l) => l(this.s)) }
  subscribe(l: (s: S) => void) { this.ls.push(l) }
  unsubscribe(l: (s: S) => void) { this.ls.splice(this.ls.indexOf(l), 1) }
}

// Domain/States/base.states.ts
export interface IPlocState { isLoading: boolean; errors: Record<string, string[]> }

// Domain/Entities (plantilla)
export class XxxEntity {
  private constructor(private readonly props: Required<XxxPropsType>) {}
  static create(p: XxxPropsType): ResultType<XxxEntity> { /* validar */ return undefined as never }
  static fromPersistence(r: Record<string, unknown>): ResultType<XxxEntity> { /* mapear */ return undefined as never }
  toProps(): XxxPropsType { return { ...this.props } }
  toItem(): XxxItemType { return { ...this.props } as unknown as XxxItemType }
}

// Application/Services/I<Xxx>ApiService.ts (port, dueño lógico del recurso)
export interface IXxxApiService {
  list(): Promise<ResultType<XxxEntity[]>>;
  getById(id: string): Promise<ResultType<XxxEntity | null>>;
}

// Infrastructure/Api/<Entidad>/XxxApiService.ts (dueño físico de la ruta)
export class XxxApiService implements IXxxApiService {
  constructor(private readonly api: ApiClient, private readonly basePath = '/xxx') {}
  // list() => this.api.get<XxxDtoType[]>(this.basePath) -> fromPersistence
}

// Infrastructure DI (plantilla por entidad)
let api: IXxxApiService | null = null;
function getXxxApi(): IXxxApiService { if (!api) api = new XxxApiService(getApiClient()); return api }
// igual para UCs, services y PLOCs (lazy singleton), exportando getXxx*Ploc()

// Infrastructure Hooks
export function usePlocState<S>(ploc: Ploc<S>): S { /* useState + subscribe/unsubscribe */ return undefined as never }
```

## Nombres y convenciones

- `interface` de contrato => prefijo `I`: `IUseCase`, `IPlocState`,
  `I<Xxx>ApiService`, `I<Xxx>Service`, `IDependencies`, `IApiClient`.
  Si una carpeta solo contiene interfaces, todo archivo lleva `I`.
- `type` alias => sufijo `Type`: `XxxCommandType`, `XxxItemType`, `XxxDtoType`,
  `XxxPropsType`, `XxxFormDataType`, `ApiErrorType`, `ResultType<T>`.
- Clases concretas => sin `I` ni `Type`: `XxxEntity`, `GetXListUseCase`,
  `XxxListPloc`, `ApiClient`, `XxxApiService`.
- Archivos: `XxxEntity.ts`, `I<Xxx>ApiService.ts`, `I<Xxx>Service.ts`,
  `xxx.states.ts`, `<Verbo><Xxx>UseCase.ts`, `<Xxx><Rol>Ploc.ts` (Pascal),
  `xxx.module.ts`, `useXxx.ts` (camel). Alias `@/*` a `./src/*`.
  Barriles `index.ts` por carpeta, `import type` para tipos.
