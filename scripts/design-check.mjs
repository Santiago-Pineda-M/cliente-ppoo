// Verificador del sistema de diseño — ver docs/DESIGN_SYSTEM.md.
// Reglas automáticas (lo demás se revisa en PR con el checklist):
//   1. Literales de color (hex/rgb/hsl) SOLO en styles/tokens.css.
//   2. Sin `!important` en ningún CSS de UI.
//   3. Sin estilos inline (`style=`) en TSX de UI.
//   4. Sin `className="literal"` global en páginas/componentes/layouts/App:
//      todo estilo se referencia vía módulos (`styles.x`).
//   5. Cada .tsx de páginas/componentes/layouts (+ App.tsx) tiene su
//      `<Nombre>.module.css` colocado en la misma carpeta.
//   6. Toda referencia `alias.clase` existe en el módulo importado.
//   7. Selectores: solo clases (`.x`) en módulos; en index.css además
//      se permiten `*`, `body` y `:focus-visible` (capa base).
// Uso: pnpm design:check (exit != 0 si hay errores).

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const UI = join(ROOT, 'src', 'Infrastructure', 'UI');
const TOKENS = join(UI, 'styles', 'tokens.css');
const INDEX_CSS = join(UI, 'styles', 'index.css');

const errors = [];
const warnings = [];

function fail(rule, file, detail) {
  errors.push(`[${rule}] ${relative(ROOT, file)}: ${detail}`);
}

function warn(rule, file, detail) {
  warnings.push(`[${rule}] ${relative(ROOT, file)}: ${detail}`);
}

function walk(dir, exts) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((x) => p.endsWith(x))) out.push(p);
  }
  return out;
}

const cssFiles = walk(UI, ['.css']);
const tsxFiles = walk(UI, ['.tsx']).filter((f) => !f.endsWith('.test.tsx'));

// --- 1. Literales de color fuera de tokens.css ---
const colorRe = /(#[0-9a-fA-F]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\()/;
function codeLines(file) {
  // Sin comentarios de bloque ni de línea: evita falsos positivos.
  const noBlock = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  return noBlock.split('\n').map((l) => l.split('//')[0]);
}
for (const f of cssFiles) {
  if (f === TOKENS) continue;
  codeLines(f).forEach((code, i) => {
    if (colorRe.test(code)) fail('tokens', f, `línea ${i + 1}: literal de color fuera de tokens.css`);
  });
}

// --- 2. !important ---
for (const f of cssFiles) {
  codeLines(f).forEach((code, i) => {
    if (code.includes('!important')) fail('no-important', f, `línea ${i + 1}`);
  });
}

// --- 7. Selectores: solo clases (index.css admite *, body, :focus-visible) ---
const BASE_ALLOW = new Set(['*', 'body', ':focus-visible']);
for (const f of cssFiles) {
  if (f === TOKENS) continue;
  const src = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /([^{}]+)\{/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const head = m[1].trim();
    if (!head || head.startsWith('@')) continue;
    for (const sel of head.split(',')) {
      const s = sel.trim().split(':')[0].split(' ')[0];
      if (!s) continue;
      if (s.startsWith('.')) continue;
      if (f === INDEX_CSS && BASE_ALLOW.has(s)) continue;
      fail('selectores', f, `selector no permitido: "${sel.trim()}" (solo clases)`);
    }
  }
}

// Helpers de módulos
function definedClasses(cssPath) {
  const src = readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const set = new Set();
  const re = /\.([A-Za-z][A-Za-z0-9_-]*)/g;
  let m;
  while ((m = re.exec(src)) !== null) set.add(m[1]);
  return set;
}

// --- 3. Estilos inline en TSX ---
for (const f of tsxFiles) {
  const src = readFileSync(f, 'utf8');
  if (/\bstyle\s*=\s*[{"]/.test(src)) fail('no-inline', f, 'estilo inline (usar el .module.css colocado)');
}

// --- 4/5/6. Módulos colocados, sin className global, referencias válidas ---
const SCOPE_DIRS = ['pages', 'components', 'layouts'];
function inScope(f) {
  const rel = relative(UI, f);
  if (rel === 'App.tsx') return true;
  return SCOPE_DIRS.some((d) => rel === d || rel.startsWith(`${d}/`) || rel.startsWith(`${d}\\`));
}

const moduleUseByFile = new Map(); // cssPath -> Set(classes usadas)

for (const f of tsxFiles) {
  if (!inScope(f)) continue;
  const src = readFileSync(f, 'utf8');

  // 5. módulo colocado
  const sibling = f.replace(/\.tsx$/, '.module.css');
  if (!existsSync(sibling)) {
    fail('modulo-colocado', f, 'falta <Nombre>.module.css en la misma carpeta');
  }

  // 4. sin className literal global
  const litRe = /className\s*=\s*"([^"]*)"/g;
  let lm;
  while ((lm = litRe.exec(src)) !== null) {
    fail('no-global-class', f, `className global "${lm[1]}" (usar styles.* del módulo)`);
  }

  // imports de módulos: import alias from '...module.css'
  const impRe = /import\s+(\w+)\s+from\s+['"]([^'"]+\.module\.css)['"]/g;
  const aliases = new Map();
  let im;
  while ((im = impRe.exec(src)) !== null) {
    const alias = im[1];
    const raw = im[2];
    const abs = raw.startsWith('@/') ? join(ROOT, 'src', raw.slice(2)) : resolve(dirname(f), raw);
    aliases.set(alias, { abs, raw });
  }

  // 6. referencias alias.clase (fuera de los imports, donde
  // 'ui.module.css' aparece como texto del path)
  const body = src
    .split('\n')
    .filter((l) => !/^\s*import\s/.test(l))
    .join('\n');
  const useRe = /(\w+)\.([A-Za-z][A-Za-z0-9_]*)/g;
  let um;
  while ((um = useRe.exec(body)) !== null) {
    const [full, alias, cls] = um;
    if (!aliases.has(alias)) continue;
    const { abs: modPath, raw } = aliases.get(alias);
    if (!existsSync(modPath)) {
      fail('modulo-import', f, `importa módulo inexistente: ${raw}`);
      continue;
    }
    if (!definedClasses(modPath).has(cls)) {
      fail('clase-inexistente', f, `"${full}" no está definida en ${relative(ROOT, modPath)}`);
    }
    if (!moduleUseByFile.has(modPath)) moduleUseByFile.set(modPath, new Set());
    moduleUseByFile.get(modPath).add(cls);
  }
}

// Aviso: clases definidas y nunca usadas vía styles.*
for (const f of cssFiles) {
  if (!f.endsWith('.module.css')) continue;
  const used = moduleUseByFile.get(f) ?? new Set();
  for (const cls of definedClasses(f)) {
    if (!used.has(cls)) warn('clase-sin-uso', f, `.${cls} definida pero sin referencia styles.${cls}`);
  }
}

for (const w of warnings) console.warn(`AVISO ${w}`);
if (errors.length > 0) {
  console.error(`\ndesign:check: ${errors.length} error(es):`);
  for (const e of errors) console.error(`ERROR ${e}`);
  process.exit(1);
}
console.log(`design:check OK (${cssFiles.length} css, ${tsxFiles.length} tsx revisados)`);
