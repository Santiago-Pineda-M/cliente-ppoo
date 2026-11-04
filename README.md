# CLIENTE_PPOO

Cliente web de la API **PPOO** (personas, vehículos y documentos). React + TypeScript
con Vite y **Clean Architecture de 4 capas + PLOC**.

- Repositorio: <https://github.com/Santiago-Pineda-M/cliente-ppoo>
- API que consume: `API_PPOO` (.NET 10, JWT access+refresh + API key por sesión)

## Stack

| Pieza | Versión / herramienta |
|---|---|
| Runtime | Node.js >= 20 |
| Package manager | pnpm 10 (solo pnpm: nunca npm/yarn/bun/npx) |
| UI | React 19 + TypeScript 5.8 (Vite 6) |
| Tests | Vitest 3 + Testing Library (jsdom) |
| Estilos | CSS Modules + tokens propios (`docs/DESIGN_SYSTEM.md`) |

## Inicio rápido

```bash
pnpm install
cp .env.example .env      # ajusta VITE_API_URL a tu API
pnpm dev                  # http://localhost:5173
```

La API debe estar corriendo. Por defecto se espera en
`http://localhost:5114/api` (`API_PPOO`: `dotnet run --project src/ApiPoo2.WebApi
--launch-profile http`). La primera vez hay que sembrar el administrador desde
`#/bootstrap`.

## Variables de entorno

Solo se leen en `src/Infrastructure/DI/modules/config.module.ts` (el resto de la
app las consume vía `useDependencies()`).

| Variable | Obligatoria | Por defecto | Descripción |
|---|---|---|---|
| `VITE_API_URL` | sí | — | URL base de la API, incluyendo `/api`. Sin barra final. |
| `VITE_HTTP_TRACE` | no | `true` | Drawer de trazas HTTP. Usar `false` en producción. |

> `.env` está en `.gitignore` y **nunca** se versiona. Solo se commitea
> `.env.example`. No pongas secretos reales en variables `VITE_*`: Vite las
> incrusta en el bundle y son públicas por diseño.

## Scripts

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | `tsc --noEmit` + build de producción |
| `pnpm preview` | Previsualiza el build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest en watch |
| `pnpm test:run` | Vitest una vez (`--passWithNoTests`) |
| `pnpm design:check` | Verifica tokens del sistema de diseño |

**Orden de verificación antes de commitear:** `pnpm lint` → `pnpm typecheck` →
`pnpm test:run`.

## Arquitectura

```
UI (Infrastructure/UI, React)
  -> src/Controllers    PLOCs: estado + delegación (sin fetch ni storage)
  -> src/Application    UseCases + puertos I<Xxx>ApiService (retornan ResultType)
  -> src/Domain         TS puro: entidades, states, Ploc, ResultType
  -> src/Infrastructure ApiClient (único fetch), XxxApiService, DI, UI
```

Reglas clave:

- Sin repositorios: el acceso remoto va por servicios API por entidad.
- Las rutas REST viven **solo** en `src/Infrastructure/Api/<Entidad>/XxxApiService.ts`.
- Errores como `ResultType<T, ApiErrorType>`; no se lanza entre capas.
- La UI consume PLOCs con `useDependencies()` + `usePlocState()`.

Detalle: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) ·
Decisiones: [docs/ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md).

## Páginas

`#/` tablero · `#/personas` · `#/vehiculos` · `#/conductores` · `#/consultas` ·
`#/tipos-documento` · `#/usuarios` · `#/bootstrap` (pública) · `#/login`.
Las rutas privadas se resuelven en `UI/router/routes.ts`; la autorización real la
aplica la API (401/403).

## Cobertura de la API

| Recurso | Endpoints API | Implementados |
|---|---|---|
| auth | 5 | 5 |
| bootstrap | 1 | 1 |
| conductores | 2 | 2 |
| consultas | 4 | 4 |
| personas | 3 | 3 |
| tipos-documento | 5 | 5 |
| users/me | 1 | 1 |
| vehiculos | 10 | 10 |
| usuarios (admin) | 8 | 2 |
| **Total** | **39** | **33 (84.6 %)** |

Faltan los 6 endpoints de administración de usuarios (`GET/POST/PUT/DELETE
/api/usuarios`, `GET /{id}`, `PUT /{id}/rol`). El `docs/api/swagger.json` incluido
está desactualizado respecto a la API: ver [docs/api/README.md](docs/api/README.md).

## Tests

```bash
pnpm test:run
```

Actualmente hay 27 tests (router, PLOCs, entidades, servicios y componentes). La
capa `ApiClient`/`XxxApiService` aún no tiene pruebas. Cómo añadirlas (unitarias e
integración real) en [docs/ADDING_FEATURES.md](docs/ADDING_FEATURES.md#tests).

## Seguridad

- Sin secretos en el repositorio; `.env` ignorado.
- JWT + API key en `localStorage` **solo** vía `SessionStoreService`; credenciales
  enmascaradas en las trazas HTTP.
- No se usa `dangerouslySetInnerHTML`.
- Directrices y modelo de amenazas: [docs/SECURITY.md](docs/SECURITY.md).

## Documentación

| Archivo | Contenido |
|---|---|
| [AGENTS.md](AGENTS.md) | Reglas para agentes de código |
| [docs/ADDING_FEATURES.md](docs/ADDING_FEATURES.md) | Paso a paso para añadir funcionalidades |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Capas, patrones y plantillas |
| [docs/ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md) | Decisiones y motivos |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Tokens y componentes de UI |
| [docs/SECURITY.md](docs/SECURITY.md) | Prácticas de seguridad |
| [docs/api/](docs/api/) | Contrato OpenAPI |

## Licencia

MIT — ver [LICENSE](LICENSE).
