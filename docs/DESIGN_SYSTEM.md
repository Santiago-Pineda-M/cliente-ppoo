# Sistema de diseño — CLIENTE_PPOO

Vinculante para todo cambio en `src/Infrastructure/UI/`.
Jerarquía de componentes: `components/COMPONENT_RULES.md` (Atomic Design
adaptado de la referencia `THAppMovil/.../UI`). Este documento cubre
tokens, CSS y verificación.

## Decisión: sistema propio, no framework externo

Se evaluaron Tailwind/utility-first y CSS-in-JS. Se descartan porque:

1. Añaden una dependencia y un vocabulario ajeno al proyecto.
2. Sus valores arbitrarios (`w-[137px]`) burlan los tokens y la deriva
   vuelve sin lint adicional.
3. La skill `ui-guide` exige tokens únicos en `styles/tokens.css`.

En su lugar: **tokens propios + CSS Modules colocados + jerarquía
atoms/molecules/organisms**, con verificación automática
(`pnpm design:check`).

## Mapa de archivos

```text
src/Infrastructure/UI/
  styles/
    tokens.css      <- ÚNICO lugar con valores literales (hex/rem/px)
    index.css       <- SOLO base: reset, body, :focus-visible
  components/
    COMPONENT_RULES.md
    atoms/<A>.tsx + <A>.module.css + index.ts       <- primitivas (Button, Card, Field, Alert, Link)
    molecules/<M>.tsx + <M>.module.css + index.ts   <- composición sin PLOCs (CredentialsList)
    organisms/<O>.tsx + <O>.module.css + index.ts   <- con PLOCs (LoginForm, BootstrapPanel, ...)
  layouts/<L>.tsx + <L>.module.css + index.ts        <- estructura con children
  pages/<P>.tsx + <P>.module.css + index.ts          <- delgadas: montan organismos
  router/routes.ts (registro+guards) + useHashRoute.ts + useResolvedView.ts + index.ts
  App.tsx + App.module.css                           <- SOLO re-renderiza la vista del router
```

## Reglas de CSS (estrictas)

1. **Un módulo por componente**: `<Nombre>.tsx` + `<Nombre>.module.css`,
   mismo nombre, misma carpeta.
2. **Lo específico vive en su módulo**; lo reutilizable es un átomo.
   Antes de crear una clase nueva, buscar el átomo.
3. **Clases camelCase** (`.cardTitle`): el scope del módulo ya da el
   contexto. Una variante = sufijo (`btnPrimary`), nunca un bloque nuevo.
4. **Un selector por regla, sin anidado, sin IDs, sin `!important`,
   sin selectores de elemento** (tampoco `.bloque pre`). Lo que necesite
   estilo lleva su propia clase.
5. **El tsx solo usa `styles.*`**: prohibido `className="literal"`
   global y `style={...}`. Composición con template strings.
6. **Los CSS solo consumen tokens**: `var(--*)` en color, espaciado,
   tipo, radio y layout. Excepciones literales: hairline `1px`,
   breakpoint `768px`, `40vh/45vw` del drawer (dimensiones intrínsecas,
   declaradas una sola vez en su bloque).

## Tokens

Gramática: `--<categoria>-<nombre>[-variante]`. Categorías cerradas:
`color | space | text | radius | layout | font`.

| Escala | Valores |
|---|---|
| Espaciado (base 0.25rem) | `--space-1/2/3/4/6/8` = 0.25 / 0.5 / 0.75 / 1 / 1.5 / 2rem |
| Tipo | `--text-xs/sm/md/lg/xl` = 0.8 / 0.875 / 1 / 1.25 / 1.5rem |
| Radio | `--radius-sm/md/pill` = 4px / 12px / 999px |
| Layout | `--layout-max/max-wide/card/card-narrow` = 45 / 60 / 40 / 26rem |
| Color | Semánticos (`--color-*`); el estado nunca va solo por color |

## Formularios (regla de ancho)

Los controles ocupan **todo el ancho disponible** (`width: 100%`, sin
`max-width`): el límite lo pone la tarjeta (`cardNarrow`), no el input.
Así no quedan huecos a la derecha.

## Verificación

Orden: `pnpm design:check` -> `pnpm lint` -> `pnpm typecheck` -> `pnpm test:run`.

`design:check` falla si: literal de color fuera de `tokens.css`,
`!important`, estilo inline, `className` global, componente sin módulo
colocado, referencia `styles.x` inexistente o selector no-clase.
Avisa (no falla) ante clases definidas sin uso.

Checklist manual de PR: un `h1` por página sin saltar niveles,
`label htmlFor` + `autoComplete`, errores con `role="alert"`, estados con
texto (nunca solo color), foco visible, responsive 320/768/1024/1440,
contraste ≥ 4.5:1.
