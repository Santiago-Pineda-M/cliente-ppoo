---
name: typescript-strict
description: Reglas de TypeScript estricto para el cliente (Vite + React+TS). Usa cuando se genere o revise cualquier .ts/.tsx, tsconfig, o manejo de errores con Result.
---

# TypeScript estricto — Cliente

## tsconfig base (Vite)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

## Reglas

- `strict` siempre. Prohibido `any` explícito o implícito; usar `unknown` +
  narrowing si el tipo es desconocido (JSON de API, `catch`).
- `noUncheckedIndexedAccess`: todo acceso por índice da `T | undefined`;
  comprobar antes de usar.
- `exactOptionalPropertyTypes`: no asignar `undefined` a `prop?: string`
  salvo que el tipo incluya `| undefined`. Preferir omitir la prop.
- `import type` para importaciones solo de tipos. No mezclar tipos y valores
  en el mismo import si se puede separar.
- Fechas en el borde: `Date` solo dentro de Entities/Domain; en DTOs (`XItem`),
  Commands y JSON de API siempre ISO `string`.
- Errores con `Result<T, ApiError>`, nunca `throw` entre capas:
  ```ts
  const r = await uc.execute(cmd);
  if (!r.ok) { /* r.error: ApiError */ return; }
  // r.value: Output (narrowing por discriminante ok)
  ```
- `switch` sobre uniones discriminadas debe ser exhaustivo (con la ayuda de
  `noFallthroughCasesInSwitch` + `noImplicitReturns`).
- No `enum` numéricos; usar `union string` + `as const`.
- Tests junto al código (`*.test.ts`), sin cambiar `tsconfig` para relajar.

## Verificación

Orden: `pnpm lint` -> `pnpm typecheck` (`tsc --noEmit`) -> `pnpm test:run`.
`typecheck` debe pasar con cero errores antes de dar por terminado.
