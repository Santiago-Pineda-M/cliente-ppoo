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
  -> Domain       (TS puro: entidades, VOs, ports de repos, states, Ploc base, Result, IUseCase)
Infrastructure    (implementaciones: ApiClient fetch, repos API, DI, hooks, UI)
```

## Capas

- **src/Domain** — TypeScript puro. SIN imports de otras capas, ni de react,
  ni de fetch/axios, ni de node. Contiene:
  - `IPatterns.ts`: `ResultType<T,E>` + `IUseCase<Input,Output>` + `ApiErrorType`.
  - `Ploc.ts`: `abstract class Ploc<S>` (`state`, `changeState`, `subscribe`,
    `unsubscribe`). Sin lógica de negocio.
  - `Entities/XxxEntity.ts`: clase inmutable.
  - `ValueObjects/`: validación de primitivas (`UniqueId`, etc.).
  - `Repositories/IXxxRepository.ts`: ports (carpeta solo de interfaces).
  - `States/`: DTOs de UI (`XxxItemType` + `IXxxState` + `initialXxxState`).
  - Barril `index.ts` por carpeta. SIN carpeta `Services/` (viven en Application).
- **src/Application** — dos subcarpetas, nunca mezcladas:
  - `UseCases/<Agregado>/<Verbo><Agregado>UseCase.ts`. Una clase por operación,
    sin estado. Inyecta ports del Domain por constructor.
    Retorna `Promise<ResultType<Output>>`. NO importa Infrastructure ni Controllers.
    Commands como types locales: `type CreateXCommandType = {...}`.
  - `Services/<Xxx>Service.ts` + `Services/I<Xxx>Service.ts`. Servicios de
    aplicación (orquestan UCs, lógica transversal: auth, sync). El contrato
    es `interface I<Xxx>Service`; la implementación base (sin IO real) es
    `class <Xxx>Service implements I<Xxx>Service`. Retornan `ResultType`.
  - `Services/External/`: servicios que envuelven librerías externas o
    dependencias de terceros (formato, fecha, validación con lib). Separados
    de `UseCases/` en carpeta aparte. Solo importan `Domain` + ports de
    `Application`. El IO real (fetch, storage) NO va aquí sino en
    `Infrastructure/Services/`.
- **src/Controllers** — `<Agregado>/<Agregado><Rol>Ploc.ts` (`List|Detail|
  CreateForm|EditForm|Delete`). Extiende `Ploc<State>`. Solo importa
  `Domain` + `type` de `Application` (UC o `I<Xxx>Service`). PROHIBIDO importar
  Infrastructure, fetch, localStorage, router.
- **src/Infrastructure** — única capa que importa todo + libs externas:
  - `Api/ApiClient.ts`: wrapper fetch (único lugar con `fetch`).
  - `Repositories/XxxApiRepository.ts`: `implements IXxxRepository`, mapea
    JSON <-> Entity vía `fromPersistence/toProps`.
  - `Services/XxxService.ts`: implementaciones con IO real de los ports
    `I<Xxx>Service` de Application.
  - `DI/modules/xxx.module.ts` -> `DI/DependenciesLocator.ts` ->
    `Context/DependenciesProvider.tsx` + `useDependencies()`.
  - `Hooks/usePlocState.ts`: puente React <-> Ploc.
  - `UI/pages|components|layouts`: React. Consume PLOCs vía
    `useDependencies() + usePlocState()`, nunca repos, services con IO ni
    ApiClient directo.

## Reglas de código

1. Entidades inmutables: `private constructor` + `static create()` (valida y
   retorna `ResultType`, NO hace throw) + `static fromPersistence()` +
   `toProps()/toItem()`. Mutación => nueva instancia.
2. UseCase y Service retornan `ResultType`: `execute(input): Promise<ResultType<Output>>`.
   Nunca dejan escapar throw; convierten a `err`.
3. PLOC consume `ResultType`: `ok` => `changeState` con datos; `err` =>
   `errors: { general: [error.message] }` o por campo. `submit()` sin
   parámetros (lee `this.state.formData`). `updateField(field, value)`.
   `reset()` vuelve a `initial*State`.
4. Estados: `IPlocState { isLoading; errors: Record<string,string[]> }`.
   `XxxItemType` es DTO plano (fechas como ISO string). Nunca Entity en state.
   Cada estado tiene su `initial*` constante.
5. Repos: port `IXxxRepository { save|findById|findAll|delete|count }` en
   Domain; impl `XxxApiRepository` en Infrastructure.
6. DI: singletons lazy por closure en `DI/modules/*.module.ts`. Único lugar
   con `new`. `DependenciesLocator` expone getters.
7. UI: `const { xListPloc } = useDependencies(); const s = usePlocState(xListPloc);
   useEffect(() => { xListPloc.load(); return () => xListPloc.reset(); }, [xListPloc])`.
8. Imports: alias `@/*` siempre. `import type` para solo-tipos. Barriles
   `index.ts`; nunca deep-import si el barril lo exporta.
9. Nombres y convención I/Type:
   - `interface` o contrato de comportamiento => prefijo `I`:
     `IUseCase`, `IPlocState`, `IXxxRepository`, `I<Xxx>Service`,
     `IDependencies`, `IApiClient` (si se extrae el port). Si una carpeta
     solo contiene interfaces, todo archivo ahí lleva `I`.
   - `type` alias => sufijo `Type`: `CreateXCommandType`, `XxxItemType`,
     `XxxPropsType`, `XxxFormDataType`, `ApiErrorType`, `ResultType<T>`.
   - Clases concretas, entidades, PLOCs, DTOs como clase => sin `I` ni `Type`:
     `XxxEntity`, `GetXListUseCase`, `XxxListPloc`, `ApiClient`, `XxxApiRepository`.
   - Archivos: `XxxEntity.ts`, `IXxxRepository.ts`, `I<Xxx>Service.ts`,
     `xxx.states.ts`, `<Verbo><Xxx>UseCase.ts`, `<Xxx><Rol>Ploc.ts` (Pascal),
     `xxx.module.ts`, `useXxx.ts` (camel).

## Rechazar en revisión

- `Domain` importa `Application|Controllers|Infrastructure|react|fetch` o
  contiene carpeta `Services/`.
- `Application/Services` mezclado dentro de `UseCases/` (debe ser carpeta aparte;
  externos en `Services/External/`).
- `Application` importa `Infrastructure|Controllers`.
- `Controllers` importa `Infrastructure|fetch|localStorage`.
- UI importa `Repository|ApiClient|UseCase|Service` con IO directamente (vía Ploc).
- `new Repository|UseCase|Service|Ploc` fuera de `DI/modules/`.
- `type` sin sufijo `Type`, o `interface` de contrato sin prefijo `I`.
- Entity en estado UI, o `throw` cruzando capas (usar `ResultType`).
- Package manager distinto de pnpm.
