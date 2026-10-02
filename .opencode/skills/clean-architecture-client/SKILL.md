---
name: clean-architecture-client
description: Reglas de Clean Architecture de 4 capas + patrón PLOC para el cliente React+TS (Vite). Usa cuando se genere, revise o refactorice código de src/ (Domain, Application, Controllers, Infrastructure) o se audite la dirección de dependencias.
---

# Clean Architecture + PLOC — Cliente React+TS

Arquitectura de 4 capas. La dirección de dependencias es siempre unidireccional
y nunca se invierte:

```
UI (Infrastructure/UI, React)
  -> Controllers  (PLOCs: estado + delegación en use cases/services)
  -> Application  (use cases: 1 UC = 1 operación + services de aplicación)
  -> Domain       (TS puro: entidades, VOs, states, Ploc base, ResultType, IUseCase)
Infrastructure    (implementaciones: ApiClient fetch, XxxApiService por entidad, DI, hooks, UI)
```

NO hay repositorios: el repositorio es para persistencia local y aquí no hay.
Todo acceso a datos es vía **servicios API por entidad** (`I<Xxx>ApiService`).

## Capas

- **src/Domain** — TypeScript puro. SIN imports de otras capas, ni de react,
  ni de fetch/axios, ni de node. Contiene:
  - `IPatterns.ts`: `ResultType<T,E>` + `IUseCase<Input,Output>` + `ApiErrorType`.
  - `Ploc.ts`: `abstract class Ploc<S>` (`state`, `changeState`, `subscribe`,
    `unsubscribe`). Sin lógica de negocio.
  - `Entities/XxxEntity.ts`: clase inmutable.
  - `ValueObjects/`: validación de primitivas (`UniqueId`, etc.).
  - `States/`: DTOs de UI (`XxxItemType` + `IXxxState` + `initialXxxState`).
  - Barril `index.ts` por carpeta. SIN `Repositories/` ni `Services/`.
- **src/Application** — dos subcarpetas, nunca mezcladas:
  - `UseCases/<Agregado>/<Verbo><Agregado>UseCase.ts`. Una clase por operación,
    sin estado. Inyecta ports de servicios por constructor. **Nunca escribe
    URLs ni rutas**: consume `I<Xxx>ApiService`.
    Retorna `Promise<ResultType<Output>>`. NO importa Infrastructure ni Controllers.
    Commands como types locales: `type CreateXCommandType = {...}`.
  - `Services/<Xxx>Service.ts` + `Services/I<Xxx>Service.ts`. Servicios de
    aplicación (orquestan UCs, lógica transversal: auth, sync). El contrato
    es `interface I<Xxx>Service`; la implementación base (sin IO real) es
    `class <Xxx>Service implements I<Xxx>Service`. Retornan `ResultType`.
  - `Services/External/`: servicios que envuelven librerías externas,
    en carpeta aparte de `UseCases/`. El IO real (fetch, storage) NO va aquí
    sino en `Infrastructure/`.
  - Ports de datos remotos: `Services/I<Xxx>ApiService.ts`
    (`list|getById|create|update|remove` según exponga la API REST, retornando
    `ResultType`). Un port por entidad/recurso.
- **src/Controllers** — `<Agregado>/<Agregado><Rol>Ploc.ts` (`List|Detail|
  CreateForm|EditForm|Delete`). Extiende `Ploc<State>`. Solo importa
  `Domain` + `type` de `Application` (UC o `I<Xxx>Service`). PROHIBIDO importar
  Infrastructure, fetch, localStorage, router.
- **src/Infrastructure** — única capa que importa todo + libs externas:
  - `Api/ApiClient.ts`: wrapper fetch (único lugar con `fetch`). Adjunta auth,
    refresca con cola single-flight, emite trazas al sink.
  - `Api/<Entidad>/XxxApiService.ts`: **dueño de la ruta** (`basePath` único,
    ej `'/usuarios'`). `implements I<Xxx>ApiService`, mapea
    JSON <-> Entity vía `fromPersistence/toProps`. Un servicio por entidad.
  - `Services/XxxService.ts`: implementaciones con IO no-HTTP de los ports
    `I<Xxx>Service` (ej: storage `localStorage`).
  - `DI/modules/xxx.module.ts` -> `DI/DependenciesLocator.ts` (`IDependencies`) ->
    `Context/DependenciesProvider.tsx` + `useDependencies()`.
  - `Hooks/usePlocState.ts`: puente React <-> Ploc.
  - `UI/pages|components|layouts`: React. Consume PLOCs vía
    `useDependencies() + usePlocState()`, nunca ApiServices ni ApiClient directo.

## Reglas de código

1. Entidades inmutables: `private constructor` + `static create()` (valida y
   retorna `ResultType`, NO hace throw) + `static fromPersistence()` +
   `toProps()/toItem()`. Mutación => nueva instancia.
2. UseCase y Service retornan `ResultType`: `execute(input): Promise<ResultType<Output>>`.
   Nunca dejan escapar throw; convierten a `err`. Nunca contienen URLs.
3. PLOC consume `ResultType`: `ok` => `changeState` con datos; `err` =>
   `errors: { general: [error.message] }` o por campo. `submit()` sin
   parámetros (lee `this.state.formData`). `updateField(field, value)`.
   `reset()` vuelve a `initial*State`.
4. Estados: `IPlocState { isLoading; errors: Record<string,string[]> }`.
   `XxxItemType` es DTO plano (fechas como ISO string). Nunca Entity en state.
   Cada estado tiene su `initial*` constante.
5. Datos remotos: port `I<Xxx>ApiService` en `Application/Services/`; impl
   `XxxApiService` en `Infrastructure/Api/<Entidad>/` con `basePath` único.
   El repositorio no existe en este proyecto.
6. DI: singletons lazy por closure en `DI/modules/*.module.ts`. Único lugar
   con `new`. `DependenciesLocator` expone getters.
7. UI: `const { xListPloc } = useDependencies(); const s = usePlocState(xListPloc);
   useEffect(() => { xListPloc.load(); return () => xListPloc.reset(); }, [xListPloc])`.
8. Imports: alias `@/*` siempre. `import type` para solo-tipos. Barriles
   `index.ts`; nunca deep-import si el barril lo exporta.
9. Nombres y convención I/Type:
   - `interface` o contrato de comportamiento => prefijo `I`:
     `IUseCase`, `IPlocState`, `I<Xxx>ApiService`, `I<Xxx>Service`,
     `IDependencies`, `IApiClient` (si se extrae el port). Si una carpeta
     solo contiene interfaces, todo archivo ahí lleva `I`.
   - `type` alias => sufijo `Type`: `CreateXCommandType`, `XxxItemType`,
     `XxxDtoType`, `XxxPropsType`, `XxxFormDataType`, `ApiErrorType`, `ResultType<T>`.
   - Clases concretas, entidades, PLOCs => sin `I` ni `Type`:
     `XxxEntity`, `GetXListUseCase`, `XxxListPloc`, `ApiClient`, `XxxApiService`.
   - Archivos: `XxxEntity.ts`, `I<Xxx>ApiService.ts`, `I<Xxx>Service.ts`,
     `xxx.states.ts`, `<Verbo><Xxx>UseCase.ts`, `<Xxx><Rol>Ploc.ts` (Pascal),
     `xxx.module.ts`, `useXxx.ts` (camel).

## Rechazar en revisión

- Cualquier `XxxRepository` / `IXxxRepository` (no existen en este proyecto).
- URLs o rutas REST fuera de `Infrastructure/Api/<Entidad>/` (nunca en
  Application, Controllers o Domain).
- `Domain` importa `Application|Controllers|Infrastructure|react|fetch` o
  contiene `Repositories/` o `Services/`.
- `Application/Services` mezclado dentro de `UseCases/` (carpeta aparte;
  externos en `Services/External/`).
- `Application` importa `Infrastructure|Controllers`.
- `Controllers` importa `Infrastructure|fetch|localStorage`.
- UI importa `ApiService|ApiClient|UseCase|Service` con IO directamente (vía Ploc).
- `new ApiService|UseCase|Service|Ploc` fuera de `DI/modules/`.
- `type` sin sufijo `Type`, o `interface` de contrato sin prefijo `I`.
- Entity en estado UI, o `throw` cruzando capas (usar `ResultType`).
- Package manager distinto de pnpm.
