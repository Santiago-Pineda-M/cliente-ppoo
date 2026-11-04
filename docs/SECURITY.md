# Seguridad — CLIENTE_PPOO

Cliente SPA: **todo lo que se empaqueta es público**. La seguridad real la aplica
la API (`API_PPOO`); aquí se documenta qué hace el cliente y qué debe cuidar quien
contribuya.

## Secretos y entorno

- **Nunca** se versionan `.env`, `.env.local` ni variantes con valores reales:
  están en `.gitignore` (solo se commitea `.env.example`).
- Las variables `VITE_*` **no son secretas**: Vite las incrusta en el bundle y
  cualquiera puede leerlas. No pongas API keys, JWT, credenciales de BD ni
  cadenas de conexión.
- La API key y los JWT se obtienen en tiempo de ejecución (`POST /auth/login`),
  no se configuran en el build.
- Antes de abrir el repo o publicar: `git ls-files | grep -i env` debe mostrar
  únicamente `.env.example`.
- Si se filtra un secreto, rótalo en el servidor; borrar el commit no basta
  (queda en el historial y en forks).

## Manejo de sesión

- JWT (access + refresh) y API key se guardan en `localStorage` **solo** a través
  de `SessionStoreService` (clave `ppoo.session`).
- `ApiClient` adjunta `Authorization: Bearer` + `X-API-Key` por defecto. Las
  rutas públicas (`login`, `refresh`, `bootstrap`, `consultas`) usan `auth: false`
  para no filtrar credenciales.
- Ante `401`, refresh con **cola single-flight**: una sola renovación para todas
  las peticiones concurrentes, reintento único y logout si falla.
- Tokens y API key **nunca** entran en el estado de React ni en el DOM.
- Las trazas HTTP enmascaran `authorization` y `x-api-key` (`•••`) y truncan
  cuerpos largos. El drawer de trazas se desactiva en producción con
  `VITE_HTTP_TRACE=false`.

### Riesgo aceptado: XSS

Guardar la sesión en `localStorage` la expone a XSS. Mitigaciones actuales:

- No se usa `dangerouslySetInnerHTML` en ningún componente.
- React escapa por defecto el contenido interpolado.
- Access token de vida corta, refresh rotativo y revocable
  (`POST /auth/revoke-token`, `POST /auth/logout`).
- No se renderizan HTML/URLs de origen no confiable sin sanear.

Si el modelo de amenazas cambia (por ejemplo, contenido de usuario enriquecido),
migrar a cookies `HttpOnly` + `SameSite` requiere cambios en la API y en
`ApiClient`; no lo hagas solo en el cliente.

## Cabeceras y despliegue

El cliente no puede fijar cabeceras de seguridad; debe hacerlo el hosting:

```
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' https://API_HOST; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

- Servir siempre por HTTPS; `VITE_API_URL` también debe ser HTTPS en producción.
- CORS lo controla la API (`Cors__AllowedOrigins`): restringe el origen del
  cliente, no uses `*` con credenciales.
- `VITE_HTTP_TRACE=false` en producción (evita exponer metadatos de peticiones).

## Datos y errores

- Los DTOs se leen con `vstr`/`vnum` y se validan en `Entity.create`;
  un payload inesperado produce `ApiErrorType.kind = 'parse'`, no una excepción.
- Los mensajes de error de la API (`application/problem+json`) se muestran
  sanitizados por React. No concatenes HTML.
- No registres en consola tokens, contraseñas ni cuerpos completos.

## Dependencias y cadena de suministro

- `pnpm-lock.yaml` está versionado; instala con `pnpm install --frozen-lockfile`
  en CI.
- Revisa vulnerabilidades con `pnpm audit` y actualiza con `pnpm update`.
- No añadas dependencias para lo que ya resuelve la plataforma (`fetch`,
  `localStorage`, estado con PLOC).

## Reportar una vulnerabilidad

No abras un issue público con detalles explotables. Contacta al mantenedor
(Santiago Pineda) por correo o por mensaje privado en GitHub y describe: versión,
pasos de reproducción, impacto y mitigación propuesta.
