# AGENTS.md — CLIENTE_PPOO

Cliente web de la API. React + TypeScript (Vite) + Clean Architecture de 4 capas
(Domain, Application, Controllers, Infrastructure). Mensajes de UI y commits en español.
Documentación de referencia en `docs/`.

## Package manager: pnpm SOLO

Nunca npm, yarn, bun ni `npx`.

```bash
pnpm install           # instalar dependencias
pnpm dev               # vite dev
pnpm build             # vite build (tsc + build)
pnpm preview           # previsualizar build
pnpm lint              # eslint
pnpm typecheck         # tsc --noEmit
pnpm test               # vitest (watch)
pnpm test:run          # vitest run --passWithNoTests
```

**Orden de verificación: `pnpm lint` -> `pnpm typecheck` -> `pnpm test:run`.**

## Commits

Conventional Commits. Tipos: `feat`, `fix`, `refactor`, `docs`, `style`,
`test`, `chore`, `perf`. Scopes: `domain`, `application`, `controllers`,
`infrastructure`, `ui`, `di`, `api`, `config`.
Formato: `feat(scope): asunto en español (max 72)`.

## Arquitectura (4 capas, solo estas)

Dirección estricta de dependencias (una sola vía, nunca se invierte):

```
UI (Infrastructure/UI, React)
  -> src/Controllers   (PLOCs: estado + delegan en use cases/services; PROHIBIDO fetch/storage)
  -> src/Application   (UseCases + Services de aplicación; External/ en carpeta aparte; retornan ResultType)
  -> src/Domain        (TS puro: entidades, VOs, ports de repos, states, Ploc base, ResultType, IUseCase)
  -> src/Infrastructure (ApiClient fetch, repos API, services con IO, DI, hooks, UI)
```

- Skills vinculantes en `.opencode/skills/`: `clean-architecture-client`,
  `typescript-strict`, `api-infrastructure`. Ante conflicto entre código y skill,
  manda la skill.
- Errores con `ResultType<T, ApiErrorType>`, nunca `throw` entre capas.
- Convención: `interface` de contrato con prefijo `I` (`IXxxRepository`,
  `I<Xxx>Service`, `IDependencies`); `type` con sufijo `Type`
  (`XxxCommandType`, `XxxItemType`, `ApiErrorType`, `ResultType`).
- PLOC: extiende `Ploc<State>`; `submit()` sin parámetros; `reset()` en cleanup.
- Repository ports en `Domain/Repositories/IXxxRepository.ts`; impl en
  `Infrastructure/Repositories/XxxApiRepository.ts` (fetch vía `ApiClient`).
- Services de aplicación en `Application/Services/` (`I<Xxx>Service` + impl
  base); externos en `Application/Services/External/`; IO real en
  `Infrastructure/Services/`.
- UI consume PLOCs vía `useDependencies() + usePlocState()`, nunca repos ni
  `ApiClient` directo. `VITE_API_URL` solo se lee en Infrastructure/DI/Api.

Detalle en `docs/ARCHITECTURE.md`. Decisiones en `docs/ARCHITECTURE_DECISIONS.md`.
