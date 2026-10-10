import type { HttpTraceType } from '@/Domain';
import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import styles from './HttpTracePanel.module.css';

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// Un objeto vacío ({}) significa "nada enviado": se muestra un mensaje
// claro en vez del JSON vacío, que parece un error de render.
function pretty(value: unknown, emptyLabel: string): string {
  if (isEmpty(value)) return emptyLabel;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function statusClass(trace: HttpTraceType): string {
  if (!trace.ok) return `${styles.badge} ${styles.badgeErr}`;
  if (trace.status !== undefined && trace.status >= 400) return `${styles.badge} ${styles.badgeErr}`;
  return `${styles.badge} ${styles.badgeOk}`;
}

export function HttpTracePanel(): React.JSX.Element {
  const { httpTraceListPloc } = useDependencies();
  const state = usePlocState(httpTraceListPloc);
  const selected = state.traces.find((t) => t.id === state.selectedId) ?? null;
  const ordered = [...state.traces].reverse();

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <strong>Peticiones ({state.traces.length})</strong>
        <div>
          <button type="button" onClick={() => httpTraceListPloc.clear()}>
            Limpiar
          </button>{' '}
          <button type="button" onClick={() => httpTraceListPloc.toggle()}>
            Cerrar
          </button>
        </div>
      </div>
      <ul className={styles.list}>
        {ordered.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              className={t.id === state.selectedId ? `${styles.item} ${styles.itemActive}` : styles.item}
              onClick={() => httpTraceListPloc.select(t.id === state.selectedId ? null : t.id)}
            >
              <span className={styles.method}>{t.method}</span>
              <span className={styles.url} title={t.url}>
                {t.url}
              </span>
              <span className={statusClass(t)}>{t.status ?? 'ERR'}</span>
              <span className={styles.ms}>{t.ms}ms</span>
            </button>
          </li>
        ))}
        {ordered.length === 0 && <li className={styles.empty}>Sin peticiones todavía.</li>}
      </ul>
      {selected && (
        <div className={styles.detail}>
          <h3>
            {selected.method} {selected.url}
          </h3>
          <p>
            Estado: <span className={statusClass(selected)}>{selected.status ?? 'ERR'}</span> · {selected.ms}ms ·{' '}
            {selected.at}
          </p>
          <h4>Cabeceras enviadas</h4>
          <pre className={styles.detailPre}>{pretty(selected.reqHeaders, 'Sin cabeceras.')}</pre>
          <h4>Cuerpo enviado</h4>
          <pre className={styles.detailPre}>{pretty(selected.reqBody, 'Sin cuerpo.')}</pre>
          <h4>Respuesta</h4>
          <pre className={styles.detailPre}>{pretty(selected.resBody, 'Sin respuesta.')}</pre>
        </div>
      )}
    </div>
  );
}
