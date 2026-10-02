# Decisiones de arquitectura — CLIENTE_PPOO

Solo decisiones estructurales (sin negocio). Referencia: proyecto ejemplo
móvil con SQLite/Drizzle + `throw + normalizeError`.

## D1. `ResultType<T, ApiErrorType>` en vez de `throw + normalizeError`

- Contexto: el ejemplo propaga `throw Error` desde `Entity.create()` y
  `UseCase.execute()`, atrapado en PLOC con `normalizeError`.
- Decisión: este cliente usa `ResultType<T, ApiErrorType>`
  (`{ok:true,value} | {ok:false,error}`) en `Entity.create/fromPersistence`,
  `UseCase.execute`, `Services` y `Repositories`.
- Motivo: cliente de API remota; los fallos HTTP/red/parse/auth son esperables
  y tipables (`ApiErrorType.kind`), no excepcionales. `ResultType` obliga a
  manejar ambos caminos y preserva `fields` por campo para formularios.

## D2. `ApiClient` fetch en vez de Drizzle/SQLite

- Contexto: el ejemplo lee SQLite embebido vía `getDrizzleDb()` + schemas.
- Decisión: `fetch` nativo solo en `Infrastructure/Api/ApiClient.ts` con
  `request<T>`; repos `XxxApiRepository` mapean JSON <-> Entity.
- Motivo: cliente web de API remota, sin BD local. Centralizar `fetch` permite
  un solo punto para baseUrl, headers, token y mapeo de errores.

## D3. `XxxItemType` DTO plano, nunca Entity en UI

- Heredada del ejemplo (`CategoryItem` vs `CategoryEntity`, fechas ISO string).
- Motivo: desacopla UI del dominio; evita `Date` y métodos en el estado React.
- Convención: DTOs como `type ...Type` (ej: `XxxItemType`, `XxxFormDataType`).

## D4. Singletons lazy en `DI/modules/*.module.ts`

- Heredada del ejemplo (closures `let x|null`, único lugar con `new`).
- Motivo: wiring explícito sin contenedor externo; PLOCs stateful compartidos
  por pantalla.

## D5. `submit()` sin parámetros + `reset()` en cleanup

- Heredada del ejemplo.
- Motivo: el formulario vive en `ploc.state.formData`; el componente solo
  dispara y limpia al desmontar.

## D6. `VITE_API_URL` solo en Infrastructure/DI/Api

- Decisión propia del cliente web (el ejemplo no tenía env remota).
- Motivo: ninguna otra capa conoce el origen de datos; cambiar de entorno no
  toca Domain/Application/Controllers/UI.

## D7. Services en Application, externos en carpeta aparte

- Decisión propia (el ejemplo tenía `Domain/Services/`).
- Servicios de aplicación (`I<Xxx>Service` + `XxxService`) viven en
  `src/Application/Services/` porque orquestan UCs sin IO real.
- Envoltorios de librerías externas van en `Services/External/`, carpeta
  aparte de `UseCases/`. El IO real implementa el port en
  `src/Infrastructure/Services/`.

## D8. Convención I/Type

- `interface` de contrato => prefijo `I` (`IUseCase`, `IXxxRepository`,
  `I<Xxx>Service`, `IPlocState`, `IDependencies`). Si la carpeta solo tiene
  interfaces, todo archivo lleva `I`.
- `type` alias => sufijo `Type` (`XxxCommandType`, `XxxItemType`,
  `ApiErrorType`, `ResultType`).
