# AGENTS.md — CLIENTE_PPOO

Cliente web de la API. React + TypeScript (Vite) + Clean Architecture de 4 capas
(Domain, Application, Controllers, Infrastructure). Mensajes de UI y commits en español.
Documentación de referencia en `docs/`.

**Antes de implementar cualquier funcionalidad, lee y sigue
[`docs/ADDING_FEATURES.md`](docs/ADDING_FEATURES.md)** (checklist, recetas por
tipo de cambio, plantillas y verificación). Reglas de seguridad en
[`docs/SECURITY.md`](docs/SECURITY.md).

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

## Arquitectura (4 capas, solo estas, sin repositorios)

Dirección estricta de dependencias (una sola vía, nunca se invierte):

```
UI (Infrastructure/UI, React)
  -> src/Controllers   (PLOCs: estado + delegan en use cases/services; PROHIBIDO fetch/storage)
  -> src/Application   (UseCases + Services incl. I<Xxx>ApiService; External/ aparte; retornan ResultType)
  -> src/Domain        (TS puro: entidades, VOs, states, Ploc base, ResultType, IUseCase)
  -> src/Infrastructure (ApiClient fetch, XxxApiService por entidad, services con IO, DI, hooks, UI)
```

- NO hay repositorios (son para persistencia local). Datos remotos vía
  servicios API por entidad (`I<Xxx>ApiService` -> `XxxApiService` con `basePath` único).
- Skills vinculantes en `.opencode/skills/`: `clean-architecture-client`,
  `typescript-strict`, `api-infrastructure`. Ante conflicto entre código y skill,
  manda la skill.
- Errores con `ResultType<T, ApiErrorType>`, nunca `throw` entre capas.
- Convención: `interface` de contrato con prefijo `I` (`I<Xxx>ApiService`,
  `I<Xxx>Service`, `IDependencies`); `type` con sufijo `Type`
  (`XxxCommandType`, `XxxItemType`, `XxxDtoType`, `ApiErrorType`, `ResultType`).
- Rutas REST SOLO en `Infrastructure/Api/<Entidad>/XxxApiService.ts`.
  Application/Controllers/Domain nunca escriben URLs.
- PLOC: extiende `Ploc<State>`; `submit()` sin parámetros; `reset()` en cleanup.
- Auth JWT (access+refresh) + API key por sesión en `localStorage` SOLO vía
  `SessionStoreService`. Refresh con cola single-flight en `ApiClient`.
- UI consume PLOCs vía `useDependencies() + usePlocState()`, nunca ApiServices ni
  `ApiClient` directo. `import.meta.env` solo se lee en
  `src/Infrastructure/DI/modules/config.module.ts` (el resto usa `getAppConfig()`).

## Tests

- Los tests viven junto al código: `*.test.ts` / `*.test.tsx` (`vitest.config.ts`).
- Cada funcionalidad nueva lleva al menos un test unitario del PLOC o del
  `XxxApiService` (doble de `ApiClient`, sin red).
- No se mockea `ApiClient` con `fetch` real: usa `vi.stubGlobal('fetch', ...)`
  solo en tests del propio `ApiClient`.
- La integración contra la API va en `tests/integration/` con su propio config y
  `describe.skipIf(!process.env.API_URL)`; nunca en `pnpm test:run`.
- No commitees con `pnpm lint`, `pnpm typecheck` o `pnpm test:run` en rojo.

## Entorno y seguridad

- `.env` no se versiona; solo `.env.example`. Nunca añadas secretos reales.
- `VITE_*` es público (Vite lo incrusta en el bundle): no metas tokens ni API keys.
- Sin `dangerouslySetInnerHTML`; no loguees credenciales ni cuerpos sensibles.
- Antes de publicar: `VITE_HTTP_TRACE=false`.

Detalle en `docs/ARCHITECTURE.md`. Decisiones en `docs/ARCHITECTURE_DECISIONS.md`.
Procedimiento en `docs/ADDING_FEATURES.md`.
