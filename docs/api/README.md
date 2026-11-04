# Contrato de la API

`swagger.json` es una **copia** del OpenAPI de `API_PPOO` para consulta offline.
No lo edites a mano: regenéralo desde la API.

## Estado actual (desactualizado)

Esta copia tiene **27 rutas / 33 operaciones**, pero la API real expone **39
operaciones**. Faltan en el archivo los 6 endpoints de administración de usuarios,
que sí existen en `UsuariosController`:

| Método | Ruta | Rol |
|---|---|---|
| `GET` | `/api/usuarios` (listado paginado) | Administrator |
| `GET` | `/api/usuarios/{id}` | Administrator |
| `POST` | `/api/usuarios` | Administrator |
| `PUT` | `/api/usuarios/{id}` | Administrator |
| `DELETE` | `/api/usuarios/{id}` | Administrator |
| `PUT` | `/api/usuarios/{id}/rol` | Administrator |

Mientras no se regenere, **la fuente de verdad es el código de
`../API_PPOO/src/ApiPoo2.WebApi/Controllers`** (o el Swagger en vivo).

## Regenerar

1. Levanta la API:
   ```bash
   # desde la raíz de API_PPOO
   dotnet run --project src/ApiPoo2.WebApi --launch-profile http
   ```
2. Descarga el documento:
   ```bash
   curl -s http://localhost:5114/swagger/v1/swagger.json -o docs/api/swagger.json
   ```
3. Verifica que aparecen las 33 rutas / 39 operaciones esperadas y commitea.

> El Swagger de la API se sirve también fuera de Development. En un despliegue
> real conviene restringirlo o desactivarlo: expone el mapa completo de endpoints
> y esquemas. No incluye credenciales.

## Uso desde el cliente

| Recurso | Puerto (`Application/Services`) | Implementación (`Infrastructure/Api`) |
|---|---|---|
| auth | `IAuthApiService` | `Auth/AuthApiService.ts` |
| bootstrap | `IBootstrapApiService` | `Bootstrap/BootstrapApiService.ts` |
| conductores | `IConductorApiService` | `Conductores/ConductorApiService.ts` |
| consultas | `IConsultaApiService` | `Consultas/ConsultaApiService.ts` |
| personas | `IPersonaApiService` | `Personas/PersonaApiService.ts` |
| tipos-documento | `ITipoDocumentoApiService` | `TiposDocumento/TipoDocumentoApiService.ts` |
| users/me | `IUserProfileApiService` | `Users/UsersApiService.ts` |
| usuarios | `IUsuariosApiService` | `Users/UsersApiService.ts` |
| vehiculos | `IVehiculoApiService` | `Vehiculos/VehiculoApiService.ts` |

Las rutas se escriben **solo** en esas implementaciones (`basePath` único por
clase). Para añadir una operación, sigue `docs/ADDING_FEATURES.md`.
