---
name: ui-guide
description: Guia de diseno UI del cliente CLIENTE_PPOO (tokens de color, tipografia, espaciado y patrones de pages/components/layouts). Usa cuando se cree o modifique cualquier interfaz en src/Infrastructure/UI, se elijan colores o estilos, o se revise coherencia visual y accesibilidad.
---

# Guía UI — CLIENTE_PPOO

Cliente operativo/admin (modo `Operate` de impeccable): la escaneabilidad,
la consistencia y las expectativas nativas van antes que la expresión visual.
La marca vive en detalles precisos, no en decoración.

Ante conflicto entre esta guía y una skill externa
(`impeccable`, `frontend-ui-engineering`), manda
`clean-architecture-client` (dirección de dependencias y ubicación de archivos).

## Dónde vive cada cosa

Toda la UI está bajo `src/Infrastructure/UI/` (única capa que toca React):

```text
src/Infrastructure/UI/
  App.tsx            <- composición raíz (Providers + Layout + contenido)
  pages/             <- una página delgada por ruta (sin lógica, delega en PLOCs)
  components/        <- presentacionales, componibles, < 200 líneas
  layouts/           <- marcos (MainLayout + drawer de trazas HTTP)
  styles/
    tokens.css       <- ÚNICO lugar con valores hex/literales (contratos de color)
    index.css        <- estilos con var(...), nunca hex directos
```

`src/main.tsx` es solo bootstrap Vite (`createRoot + App + import CSS`).
Reglas vinculantes: UI consume PLOCs vía `useDependencies() + usePlocState()`;
PROHIBIDO importar `ApiClient`, `*ApiService`, use cases, `fetch`,
`localStorage` o URLs desde UI. Estados con DTOs planos (`XxxItemType`),
nunca entidades.

## Tokens de color (`styles/tokens.css`)

| Token | Valor | Uso |
|---|---|---|
| `--color-surface` | `#fafafa` | fondo drawer / paneles secundarios |
| `--color-surface-raised` | `#ffffff` | fondo botones flotantes, badges, bloques de código |
| `--color-border` | `#cccccc` | bordes estructurales (drawer, cabeceras) |
| `--color-border-soft` | `#e0e0e0` | bordes sutiles (bloques `pre`) |
| `--color-divider` | `#eeeeee` | separadores de lista |
| `--color-text` | `#1a1a1a` | texto principal |
| `--color-muted` | `#666666` | texto secundario, tiempos, vacíos |
| `--color-accent-soft` | `#e8eefc` | fila seleccionada / foco suave |
| `--color-primary` | `#1d4ed8` | acción principal (contraste 8.6:1 sobre blanco) |
| `--color-primary-hover` | `#1e40af` | hover de acción principal |
| `--color-on-primary` | `#ffffff` | texto sobre primario |
| `--color-ok` | `#2e7d32` | badges/estados de éxito |
| `--color-err` | `#c62828` | badges/errores (siempre con texto o icono, nunca solo color) |
| `--radius-sm` | `4px` | badges, bloques |
| `--radius-pill` | `999px` | botón flotante (FAB) |
| `--font-sans` | `system-ui, sans-serif` | única familia del cliente |

Reglas:

1. En `index.css` y componentes: SOLO `var(--color-*)`. Un hex literal fuera
   de `tokens.css` se rechaza en revisión.
2. Contraste mínimo 4.5:1 en texto normal, 3:1 en texto grande.
3. El estado nunca se comunica SOLO con color: el badge lleva texto
   (`OK`/`ERR`), el error lleva `role="alert"`, el vacío lleva icono + texto.
4. Sin estética "AI por defecto": nada de morado/indigo genérico, gradientes
   decorativos, `rounded` máximo en todo, sombras pesadas ni hero genérico.
   Superficies planas, un radio coherente, jerarquía por espaciado y peso.

## Tipografía y espaciado

- Jerarquía: `h1` título de página (uno por página) → `h2` sección →
  `h3` subsección → cuerpo → `small` ayuda. Sin saltar niveles.
- Escala de espaciado en pasos de `0.25rem`. Valores en uso:
  `0.35 / 0.4 / 0.5 / 0.6 / 0.9 / 1rem`. No inventar px arbitrarios.
- Formularios: `label` visible + `input` bloque `max-width: 320px`;
  `autoComplete` (`username`, `current-password`); errores por campo o
  `errors.general` con `role="alert"`; botón deshabilitado con `isSubmitting`.

## Patrones de componentes

Composición sobre configuración y contenedor/presentación separados
(los datos los resuelve el PLOC, el componente solo renderiza):

```tsx
// Página delgada: PLOC + estados. Nunca fetch ni ApiService aquí.
const { authPloc } = useDependencies();
const auth = usePlocState(authPloc);
useEffect(() => {
  void authPloc.checkSession();
  return () => authPloc.reset();
}, [authPloc]);

if (auth.isLoading) return <p>Cargando sesión…</p>;
if (auth.errors.general) return <p role="alert">{...}</p>;
```

- Vacíos y errores con significado: icono + título + descripción + acción
  (`role="status"`), nunca pantallas en blanco.
- Carga de contenido: skeleton (`aria-busy="true"`), no spinners eternos.
- Drawer colapsable (patrón `MainLayout`): panel lateral + FAB `HTTP` para
  reabrir; el FAB lleva `title` descriptivo.
- Clases BEM existentes: `.layout__*` (marco), `.trace-*` (trazas).
  Nuevos bloques siguen el mismo sufijo (`__elemento`, `--modificador`).

## Accesibilidad mínima (WCAG 2.1 AA)

- Todo lo interactivo es `<button>`/`<a>`/`<input>` real (focusable por defecto).
- Inputs con `<label htmlFor>`, iconos-botón con `aria-label`.
- Foco visible siempre (`:focus-visible` con `--color-primary`).
- Responsive mobile-first; verificar a 320 / 768 / 1024 / 1440 px.

## Rechazar en revisión

- Hex/rgb literales fuera de `tokens.css`; estilos inline.
- UI que importa `*ApiService`, `ApiClient`, use cases, `fetch`, `localStorage`.
- `new Ploc|UseCase|Service` fuera de `DI/modules/`.
- Pantallas en blanco, errores solo por color, elementos clicables no focusables.
- Componentes de más de 200 líneas o con lógica de negocio.
