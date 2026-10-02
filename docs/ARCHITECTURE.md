# Arquitectura — CLIENTE_PPOO

Cliente web de la API: **React + TypeScript (Vite) + Clean Architecture de 4 capas
+ PLOC**. Solo arquitectura (sin reglas de negocio). Referencia estructural:
proyecto ejemplo con `src/Domain|Application|Controllers|Infrastructure`.

## Capas y dirección de dependencias

Estrictamente unidireccional, nunca se invierte:

```
UI (Infrastructure/UI, React)
  └─> src/Controllers   (PLOCs: estado + delegación en use cases/services; PROHIBIDO fetch/storage/router)
        └─> src/Application (UseCases + Services de aplicación, sin estado, inyectan ports, retornan ResultType)
              └─> src/Domain (TS puro: entidades, VOs, ports de repos, states, Ploc base, ResultType, IUseCase)
src/Infrastructure         (ApiClient fetch, repos API, services con IO, DI, hooks, UI)
```

- **`src/Domain`** — TS puro, cero imports de otras capas, react o fetch.
  `IPatterns.ts` (`ResultType<T,E>`, `ApiErrorType`, `IUseCase`), `Ploc.ts`
  (`state`, `changeState`, `subscribe`, `unsubscribe`), `Entities/*Entity.ts`,
  `ValueObjects/*`, `Repositories/IXxxRepository.ts`,
  `States/*` (`XxxItemType` + `IXxxState` + `initialXxxState`).
  SIN carpeta `Services/` (viven en Application).
- **`src/Application`** — dos subcarpetas, nunca mezcladas:
  - `UseCases/<Agregado>/<Verbo><Agregado>UseCase.ts`. Sin estado, inyecta
    ports del Domain, retorna `Promise<ResultType<Output>>`.
    Commands como `type XxxCommandType = {...}` junto al UC.
  - `Services/<Xxx>Service.ts` + `Services/I<Xxx>Service.ts`. Servicios de
    aplicación (orquestan UCs). Contratos `interface I<Xxx>Service`.
  - `Services/External/`: envoltorios de librerías externas, en carpeta
    aparte de `UseCases/`. El IO real vive en `Infrastructure/Services/`.
- **`src/Controllers`** — `<Agregado>/<Agregado><Rol>Ploc.ts`
  (`List|Detail|CreateForm|EditForm|Delete`). Extiende `Ploc<State>`, expone
  `load/submit/updateField/reset`. Solo importa `Domain` + `type` de
  Application (UC o `I<Xxx>Service`).
- **`src/Infrastructure`** — implementaciones:
  `Api/ApiClient.ts` (único `fetch`), `Repositories/XxxApiRepository.ts`
  (`implements IXxxRepository`, JSON <-> Entity),
  `Services/XxxService.ts` (IO real de `I<Xxx>Service`),
  `DI/modules/*.module.ts` (singletons lazy, único `new`) ->
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

## Flujo de datos (ejemplo lista)

```
UI --load()--> XListPloc --execute()--> GetXListUseCase --findAll()-->
IXxxRepository --request()--> XxxApiRepository/ApiClient --> API
API --> JSON --> fromPersistence() --> Entity --> toItem() --> XxxItemType
--> changeState({ items }) --> usePlocState --> render
```

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

// Domain/Repositories/IXxxRepository.ts
export interface IXxxRepository {
  save(e: XxxEntity): Promise<ResultType<void>>; findById(id: string): Promise<ResultType<XxxEntity | null>>;
  findAll(): Promise<ResultType<XxxEntity[]>>; delete(id: string): Promise<ResultType<void>>; count(): Promise<ResultType<number>>;
}

// Application (UseCases + Services)
export type CreateXxxCommandType = { [k: string]: unknown };
export class CreateXxxUseCase implements IUseCase<CreateXxxCommandType, XxxEntity> {
  constructor(private repo: IXxxRepository) {}
  async execute(c: CreateXxxCommandType): Promise<ResultType<XxxEntity>> { return undefined as never }
}
export interface IXxxService { run(input: unknown): Promise<ResultType<void>> }

// Controllers
export class XxxListPloc extends Ploc<IXxxListState> {
  constructor(private uc: GetXxxListUseCase) { super(initialXxxListState) }
  async load(): Promise<void> { /* execute -> ok: toItem(), err: errors */ }
  reset(): void { this.changeState(initialXxxListState) }
}

// Infrastructure DI (plantilla por feature)
let repo: IXxxRepository | null = null;
function getRepo(): IXxxRepository { if (!repo) repo = new XxxApiRepository(getApiClient()); return repo }
// igual para UCs, services y PLOCs (lazy singleton), exportando getXxx*Ploc()

// Infrastructure Hooks
export function usePlocState<S>(ploc: Ploc<S>): S { /* useState + subscribe/unsubscribe */ return undefined as never }
```

## Nombres y convenciones

- `interface` de contrato => prefijo `I`: `IUseCase`, `IPlocState`,
  `IXxxRepository`, `I<Xxx>Service`, `IDependencies`, `IApiClient`.
  Si una carpeta solo contiene interfaces, todo archivo lleva `I`.
- `type` alias => sufijo `Type`: `XxxCommandType`, `XxxItemType`,
  `XxxPropsType`, `XxxFormDataType`, `ApiErrorType`, `ResultType<T>`.
- Clases concretas => sin `I` ni `Type`: `XxxEntity`, `GetXListUseCase`,
  `XxxListPloc`, `ApiClient`, `XxxApiRepository`.
- Archivos: `XxxEntity.ts`, `IXxxRepository.ts`, `I<Xxx>Service.ts`,
  `xxx.states.ts`, `<Verbo><Xxx>UseCase.ts`, `<Xxx><Rol>Ploc.ts` (Pascal),
  `xxx.module.ts`, `useXxx.ts` (camel). Alias `@/*` a `./src/*`.
  Barriles `index.ts` por carpeta, `import type` para tipos.
