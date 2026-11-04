# Cómo añadir funcionalidades — guía para agentes

Procedimiento operativo para extender el cliente sin romper la arquitectura.
Léelo antes de tocar código; las reglas de `AGENTS.md` y de las skills de
`.opencode/skills/` son vinculantes.

## Reglas no negociables

1. **Dirección de dependencias:** `UI → Controllers → Application → Domain`,
   con `Infrastructure` implementando los puertos. Nunca se invierte.
2. **Sin repositorios** ni persistencia local. Datos remotos solo por
   `I<Xxx>ApiService` → `XxxApiService`.
3. **Rutas REST solo** en `src/Infrastructure/Api/<Entidad>/XxxApiService.ts`.
   Ni `Application`, ni `Controllers`, ni `Domain` escriben URLs.
4. **Sin `fetch`** fuera de `ApiClient`. **Sin `localStorage`** fuera de
   `SessionStoreService`.
5. **Errores con `ResultType<T, ApiErrorType>`**, nunca `throw` entre capas.
6. **La UI no conoce servicios ni `ApiClient`**: solo PLOCs vía
   `useDependencies()` + `usePlocState()`.
7. **Sin secretos en el repo.** Solo `VITE_*` públicas (Vanilla Vite las incrusta
   en el bundle). Ver `docs/SECURITY.md`.
8. Mensajes de UI, documentación y commits **en español**.

## Checklist rápido

Copia esto en tu plan y márcalo al terminar:

```
[ ] Contrato del endpoint revisado (API real o docs/api/README.md)
[ ] Entity/Item/State en Domain (si hay datos nuevos)
[ ] I<Xxx>ApiService ampliado (Application/Services)
[ ] XxxApiService implementado (Infrastructure/Api/<Entidad>)
[ ] UseCase creado/ampliado (Application/UseCases/<Agregado>)
[ ] PLOC actualizado (Controllers/<Agregado>)
[ ] Módulo DI actualizado (Infrastructure/DI/modules)
[ ] DependenciesLocator ampliado (si hay PLOC nuevo)
[ ] Página/componente conectado (UI/pages o UI/components)
[ ] Ruta registrada (UI/router/routes.ts + App.tsx + SideNav)
[ ] Tests unitarios añadidos
[ ] docs/api y README actualizados (cobertura y contrato)
[ ] pnpm lint && pnpm typecheck && pnpm test:run
```

## Receta A — nuevo endpoint en un recurso existente

Ejemplo: `PUT /api/vehiculos/{id}/documentos/{tipoDocumentoId}/estado` (ya
existe; sirve de referencia en `VehiculoApiService`).

1. **Contrato.** Confirma método, ruta, body y códigos de la API real
   (`../API_PPOO/src/ApiPoo2.WebApi/Controllers`) o de `docs/api/swagger.json`.
2. **Puerto.** Añade el método a `src/Application/Services/I<Entidad>ApiService.ts`
   con `CommandType` si hay body y retorno `Promise<ResultType<...>>`.
3. **Implementación.** En `src/Infrastructure/Api/<Entidad>/<Entidad>ApiService.ts`:

   ```ts
   async cambiarEstadoDocumento(cmd: CambiarEstadoDocumentoCommandType): Promise<ResultType<VehiculoEntity>> {
     const res = await this.api.put<VehiculoDtoType>(
       `${this.basePath}/${encodeURIComponent(cmd.vehiculoId)}/documentos/${encodeURIComponent(cmd.tipoDocumentoId)}/estado`,
       { estado: cmd.estado },
     );
     if (!res.ok) return res;
     return toEntity(res.value);
   }
   ```

   Reglas: `encodeURIComponent` en segmentos variables, mapear JSON → Entity,
   `isNotFound` para 404 → `{ ok: true, value: null }`, `vstr`/`vnum` de
   `api-helpers.ts` para leer DTOs sin `any`.
4. **Caso de uso.** Añade la clase en `Application/UseCases/<Agregado>/...`:

   ```ts
   export class CambiarEstadoDocumentoUseCase
     implements IUseCase<CambiarEstadoDocumentoCommandType, VehiculoEntity> {
     constructor(private readonly vehiculosApi: IVehiculoApiService) {}
     execute(cmd: CambiarEstadoDocumentoCommandType) {
       return this.vehiculosApi.cambiarEstadoDocumento(cmd);
     }
   }
   ```
5. **PLOC.** Inyecta el UC y expón un método de acción; no metas lógica de
   negocio, solo orquestación de estado:
   ```ts
   async cambiarEstadoDocumento(tipoDocumentoId: string, estado: EstadoDocumentoType): Promise<void> {
     const res = await this.uc.execute({ vehiculoId: this.state.vehiculo?.id ?? '', tipoDocumentoId, estado });
     if (!res.ok) { this.changeState({ ...this.state, errors: { general: [res.error.message] } }); return; }
     await this.load(res.value.id);
   }
   ```
6. **DI.** Pasa el nuevo UC al constructor del PLOC en
   `src/Infrastructure/DI/modules/<entidad>.module.ts` (singleton lazy).
7. **UI.** Añade el control en la página correspondiente llamando al método del
   PLOC. Sin `fetch`, sin URLs, sin acceso a servicios.
8. **Tests** (ver [Tests](#tests)) y verificación final.

## Receta B — recurso nuevo de punta a punta

Orden exacto de creación (cada paso solo depende del anterior):

| # | Archivo | Qué contiene |
|---|---|---|
| 1 | `src/Domain/Entities/XxxEntity.ts` | `create` (valida), `fromPersistence` (mapea DTO), `toItem` |
| 2 | `src/Domain/States/xxx.states.ts` | `XxxItemType`, `IXxxState`, `initialXxxState`, `XxxFormDataType` |
| 3 | `src/Domain/index.ts` y `States/index.ts` | Re-exportar |
| 4 | `src/Application/Services/IXxxApiService.ts` | Puerto + `*CommandType` |
| 5 | `src/Application/UseCases/Xxx/XxxUseCases.ts` | Un UC por verbo; delegan en el puerto |
| 6 | `src/Infrastructure/Api/Xxx/XxxApiService.ts` | `basePath` único + mapeo JSON↔Entity |
| 7 | `src/Controllers/Xxx/XxxListPloc.ts` (o `Detail`) | `Ploc<State>`: `load/submit/updateField/reset` |
| 8 | `src/Infrastructure/DI/modules/xxx.module.ts` | `getXxxApiService`, UCs, `getXxxPloc` |
| 9 | `src/Infrastructure/DI/DependenciesLocator.ts` | Añadir el PLOC a `IDependencies` |
| 10 | `src/Infrastructure/UI/pages/XxxPage.tsx` (+ `.module.css`) | Página delgada |
| 11 | `src/Infrastructure/UI/pages/index.ts` | Exportar la página |
| 12 | `src/Infrastructure/UI/router/routes.ts` | `AppRouteType`, `ROUTES`, `getRouteFromHash`, guards |
| 13 | `src/Infrastructure/UI/App.tsx` | `case` en el `switch` de vistas |
| 14 | `src/Infrastructure/UI/components/organisms/SideNav.tsx` | Enlace de navegación |
| 15 | Tests + docs | Ver abajo |

Plantillas de código: sección **“Estructuras clave”** de
`docs/ARCHITECTURE.md`. Ejemplo real completo de esta receta:
`tipos-documento` (`ITipoDocumentoApiService` → `TipoDocumentoApiService` →
`TiposDocumentoUseCases` → `TipoDocumentoListPloc` → `tipos-documento.module`).

### Convenciones de nombres

- `interface` de contrato → prefijo `I`: `IXxxApiService`, `IXxxState`, `IUseCase`.
- `type` → sufijo `Type`: `XxxCommandType`, `XxxItemType`, `XxxDtoType`,
  `ApiErrorType`, `ResultType`.
- Clases concretas sin prefijo ni sufijo: `XxxEntity`, `XxxApiService`,
  `XxxListPloc`, `GetXxxUseCase`.
- Archivos: `XxxEntity.ts`, `IXxxApiService.ts`, `xxx.states.ts`,
  `<Verbo><Xxx>UseCase.ts`, `<Xxx><Rol>Ploc.ts`, `xxx.module.ts`.

## Receta C — solo UI

1. Usa átomos/molecules existentes (`UI/components/atoms|molecules`); si falta
   algo reutilizable, créalo con su `.module.css` y tokens de
   `docs/DESIGN_SYSTEM.md`.
2. La página es “delgada”: `useDependencies()` + `usePlocState()`, sin lógica de
   datos.
3. Accesibilidad mínima: `label` asociado al input, `aria-busy` en cargas,
   `Alert` con `role="alert"` para errores, foco visible.
4. Si añades tokens o cambios visuales, ejecuta `pnpm design:check`.

## Dónde NO tocar

- `src/Domain` no importa React, `fetch`, `localStorage` ni otras capas.
- `src/Application` no importa `Infrastructure` ni `Controllers`.
- `Controllers` no importan `Infrastructure` (solo `Domain` y `type` de
  `Application`).
- `ApiClient` no importa `Application` ni `Controllers`.
- No añadas `Repositories/`, `axios`, `react-query` ni un contenedor DI externo.

## Tests

### Unitarios (por defecto, sin backend)

- **`ApiClient`** — el único `fetch`. Mockea el global:

  ```ts
  import { afterEach, describe, expect, it, vi } from 'vitest';
  import { ApiClient } from './ApiClient';

  afterEach(() => vi.unstubAllGlobals());

  it('adjunta Authorization y X-API-Key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const client = new ApiClient('http://api.test');
    client.setAuthHeaderProvider(() => ({ access: 'a', apiKey: 'k' }));

    await client.get('/x');

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe('Bearer a');
    expect(headers.get('X-API-Key')).toBe('k');
  });
  ```

  Cubre además: `auth: false` sin headers, `application/problem+json` →
  `ApiErrorType`, refresh single-flight ante 401 concurrentes y reintento único.

- **`XxxApiService`** — pásale un doble de `ApiClient`, sin red:

  ```ts
  const api = { get: vi.fn().mockResolvedValue({ ok: true, value: [{ id: '1', /* ... */ }] }) };
  const svc = new XxxApiService(api as unknown as ApiClient);
  await svc.list();
  expect(api.get).toHaveBeenCalledWith('/xxx');
  ```

  Verifica método, URL, body y el mapeo DTO → Entity (incluido 404 → `null`).

- **PLOC** — dobles de los casos de uso, como en
  `src/Controllers/Users/UsersPloc.test.ts`. Comprueba estado final, `errors` y
  `isLoading`.
- **UI** — Testing Library, como en
  `UI/components/organisms/LoginForm.test.tsx` (render con
  `DependenciesProvider` y PLOC real o doble).

Los tests viven junto al archivo (`*.test.ts`/`*.test.tsx`) y `vitest.config.ts`
ya los recoge con `environment: 'jsdom'`.

### Integración contra la API real

No hay harness todavía. Para añadirlo sin romper `pnpm test:run`:

1. Crea `tsconfig`/config aparte `vitest.integration.config.ts`:
   ```ts
   import { defineConfig } from 'vitest/config';
   import path from 'node:path';

   export default defineConfig({
     resolve: { alias: { '@': path.resolve(__dirname, './src') } },
     test: { environment: 'node', include: ['tests/integration/**/*.test.ts'], testTimeout: 20000 },
   });
   ```
2. Añade el script `"test:integration": "vitest run --config vitest.integration.config.ts"`.
3. En cada spec usa guardas para saltar sin backend:
   ```ts
   const API_URL = process.env.API_URL;
   describe.skipIf(!API_URL)('API real', () => { /* ... */ });
   ```
4. Flujo recomendado: `POST /bootstrap/admin` (si está vacío) → `login` →
   `GET /users/me` → crear persona → crear vehículo → consultas → `logout`.
   Toma credenciales de variables de entorno, nunca del repo.
5. Ejecuta con la API levantada:
   ```bash
   API_URL=http://localhost:5114/api pnpm test:integration
   ```

No incluyas integración en el CI público sin un backend efímero: déjala como
job manual o con `skipIf`.

## Verificación obligatoria

```bash
pnpm lint
pnpm typecheck
pnpm test:run
```

Para cambios de UI, además `pnpm design:check`; antes de publicar, `pnpm build`.
No commitees con cualquiera de estos pasos en rojo.

## Documentación que debes actualizar

- `README.md`: tabla de cobertura si añades/quitas endpoints.
- `docs/api/swagger.json` o `docs/api/README.md`: si cambia el contrato.
- `docs/ARCHITECTURE.md`: solo si cambia una regla estructural.
- `docs/ADDING_FEATURES.md`: si el procedimiento cambia.
- Este repo mantiene la documentación en español.

## Commits

Conventional commits en español, imperativo y alcance por capa:

```
feat(api): añade CRUD de usuarios administradores
feat(ui): página de usuarios con listado y rol
test(api): cubre refresh single-flight en ApiClient
docs: actualiza cobertura de endpoints
fix(vehiculos): corrige 404 al buscar por placa
```

Un commit = un cambio coherente. No mezcles refactors con funcionalidad.

## Trabajo pendiente conocido

Los 6 endpoints de administración de usuarios son el hueco funcional actual:
`GET/POST /api/usuarios`, `GET/PUT/DELETE /api/usuarios/{id}` y
`PUT /api/usuarios/{id}/rol` (todos requieren rol `Administrator`). Para
cerrarlo, sigue la Receta A dentro del recurso `usuarios` ya existente
(`UsersApiService` y `users.module.ts`). No olvides el flag `Authorization` +
`X-API-Key` (lo pone `ApiClient` por defecto) y el 403 por rol.
