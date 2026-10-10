# REGLAS DE ARQUITECTURA DE COMPONENTES — CLIENTE_PPOO

**Ubicación:** `src/Infrastructure/UI/components/`
**Inspirado en:** `THAppMovil/src/Infrastructure/UI` (Atomic Design adaptado).
Adaptaciones web: StyleSheet → CSS Modules colocados, theme → `styles/tokens.css`,
expo-router → hash router propio, sin iconografía externa.

## JERARQUÍA ESTRICTA

```text
components/
  atoms/       → Primitivas puras (0 PLOCs, solo props + su .module.css)
  molecules/   → Composición de átomos (solo props, 0 PLOCs)
  organisms/   → Con estado/negocio (usan PLOCs vía useDependencies)
layouts/       → Estructura de pantalla (slots via children, 0 PLOCs de negocio)
pages/         → Pantallas delgadas (montan organismos, 0 construcción inline)
router/        → Registro de rutas + guards (único lector de AuthPloc fuera de organisms)
styles/        → tokens.css (valores) + index.css (base) — equivale a globalStyles/
```

> Diferencia con la referencia: allá `layouts/` vive dentro de `components/`;
> aquí vive en `UI/layouts/` por convención de la skill `ui-guide`. La regla
> es la misma: el layout no contiene datos ni contenido semántico.

## 📦 ATOMS (`atoms/`)

**Regla de oro:** _Cero PLOCs. Solo props + su módulo CSS._

| ✅ Permitido              | ❌ Prohibido       |
| ------------------------- | ------------------ |
| Props tipadas (`XxxProps`)| `useDependencies()`|
| Su `<Xxx>.module.css`     | `usePlocState()`   |
| Componer otros átomos     | Lógica de negocio  |
| Clases camelCase          | `fetch` / storage  |

**Actuales:** `Button`, `Card` (+`CardTitle/Meta/Foot`), `Field`, `Alert`, `Link`.
**Naming:** `PascalCase.tsx` + export named en `index.ts`.

## 🧬 MOLECULES (`molecules/`)

**Regla de oro:** _Solo componen átomos. Reciben TODO por props._

| ✅ Permitido          | ❌ Prohibido      |
| --------------------- | ----------------- |
| Props tipadas         | `useDependencies()`|
| Átomos + su módulo    | `usePlocState()`  |
| Listas internas       | Estado de datos   |

**Actuales:** `CredentialsList` (las específicas de pantalla vivirían en
`pages/<Pantalla>/components/`, como en la referencia).

## 🦠 ORGANISMS (`organisms/`)

**Regla de oro:** _Aquí VIVE la conexión a PLOCs. Un organismo = una feature UI autónoma._

| ✅ Permitido                    | ❌ Prohibido                     |
| ------------------------------- | -------------------------------- |
| `useDependencies()`             | Acceso directo a ApiServices     |
| `usePlocState(ploc)`            | Lógica de caso de uso (va en PLOC)|
| `useState` local de UI          | Props de datos (>3 → dividir)    |
| Composición átomos/moléculas    | `window.location` fuera del router|

**Actuales:** `LoginForm`, `BootstrapPanel`, `SessionCard`, `HttpTracePanel`.

**Patrón obligatorio:**

```tsx
export function XxxPanel(): React.JSX.Element {
  const { xxxPloc } = useDependencies();
  const s = usePlocState(xxxPloc);
  useEffect(() => () => xxxPloc.reset(), [xxxPloc]);
  return (
    <Card labelledBy="...">
      ...átomos y moléculas con datos de `s`...
    </Card>
  );
}
```

## 🧭 ROUTER (`UI/router/` — excepción documentada)

**Regla de oro:** _Toda protección y redirección vive aquí. Los componentes
(App incluida) solo RE-RENDERIZAN la vista resuelta. Prohibido decidir rutas,
leer sesión o redirigir en componentes._

| ✅ Permitido (solo router)          | ❌ Prohibido en componentes      |
| ----------------------------------- | -------------------------------- |
| `useDependencies()` solo AuthPloc   | Leer `authPloc` para decidir vista|
| `checkSession()` al arrancar        | `navigateTo` / tocar `location.hash`|
| `navigateTo()` en guards            | Tablas o políticas de rutas      |
| Tabla `ROUTES` + `resolveView`/`redirectFor` |                       |

```tsx
// ✅ CORRECTO - App.tsx
function Root(): React.JSX.Element {
  const { view, isLoading } = useResolvedView(); // el router ya decidió
  if (isLoading) return ...;
  if (view === 'home') return ...;
  return ...;
}
```

## 🏗 LAYOUTS (`UI/layouts/`)

**Regla de oro:** _Estructura, NO contenido. Slots para organismos._

| ✅ Permitido              | ❌ Prohibido      |
| ------------------------- | ----------------- |
| Contenedores + `children` | Contenido semántico|
| Drawer / slots            | Datos / PLOCs     |

## 📄 PAGES (`UI/pages/`)

**Regla de oro:** _Mínimo código. Solo: composición + organismos._

```tsx
// ✅ CORRECTO
export function LoginPage(): React.JSX.Element {
  return (
    <div className={styles.page}>
      <LoginForm /> {/* Organismo autónomo */}
    </div>
  );
}
```

```tsx
// ❌ INCORRECTO - NO hacer en pages/
<section className={...}><h1>...</h1><form>...</form></section> // Construcción inline
{state.items.map(...) /* Lógica de render */}
```

## IMPORT RULES

```tsx
// ✅ Átomos: barrel
import { Button, Card, Field, Alert, Link } from '@/Infrastructure/UI/components/atoms';

// ✅ Moléculas: barrel
import { CredentialsList } from '@/Infrastructure/UI/components/molecules';

// ✅ Organismos: barrel
import { LoginForm } from '@/Infrastructure/UI/components/organisms';

// ✅ Layouts y páginas: barrel
import { MainLayout } from '@/Infrastructure/UI/layouts';
import { LoginPage } from '@/Infrastructure/UI/pages';

// ✅ Router: barrel
import { useResolvedView } from '@/Infrastructure/UI/router';

// ❌ NUNCA deep-import si el barril lo exporta
// ❌ NUNCA importar páginas desde components/
// ❌ NUNCA importar organisms en atoms/molecules
// ❌ NUNCA decidir rutas ni leer sesión en componentes (eso es del router)
```

## ICONOGRAFÍA (`lucide-react` — única librería)

Elegida por liviana (tree-shaking por icono) y completa (1500+ iconos).
Sin emojis como iconos, sin otras librerías.

```tsx
import { Truck, type LucideIcon } from 'lucide-react';

// ✅ Icono decorativo: tamaño por prop + aria-hidden
<Icon size={18} aria-hidden="true" />

// ✅ Molécula que recibe icono: tipo LucideIcon por props
function StatCard({ icon: Icon }: { icon: LucideIcon }) { ... }
```

## CHECKLIST DE REVISIÓN (PR)

| Pregunta                              | Si SÍ → va en    |
| ------------------------------------- | ---------------- |
| ¿Usa `useDependencies`/`usePlocState`?| **organisms/**   |
| ¿Solo props + átomos?                 | **molecules/**   |
| ¿Solo props + su módulo?              | **atoms/**       |
| ¿Es estructura/slots?                 | **layouts/**     |
| ¿Es pantalla completa?                | **pages/**       |
| ¿El CSS tiene literal fuera de tokens?| Rechazar         |
| ¿El tsx usa `className="..."` global? | Rechazar (usar `styles.*`) |
| ¿Es registro/guard de ruta?             | **router/**      |
| ¿El componente no tiene `.module.css`?| Rechazar         |
| ¿El componente decide rutas o lee sesión?| Rechazar (va en router) |
