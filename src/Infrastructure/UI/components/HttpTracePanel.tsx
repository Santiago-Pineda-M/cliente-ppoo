import type { HttpTraceType } from '@/Domain';
import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';

function pretty(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function statusClass(trace: HttpTraceType): string {
  if (!trace.ok) return 'trace-badge trace-badge--err';
  if (trace.status !== undefined && trace.status >= 400) return 'trace-badge trace-badge--err';
  return 'trace-badge trace-badge--ok';
}

export function HttpTracePanel(): React.JSX.Element {
  const { httpTraceListPloc } = useDependencies();
  const state = usePlocState(httpTraceListPloc);
  const selected = state.traces.find((t) => t.id === state.selectedId) ?? null;
  const ordered = [...state.traces].reverse();

  return (
    <div className="trace-panel">
      <div className="trace-panel__head">
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
      <ul className="trace-list">
        {ordered.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              className={t.id === state.selectedId ? 'trace-item trace-item--active' : 'trace-item'}
              onClick={() => httpTraceListPloc.select(t.id === state.selectedId ? null : t.id)}
            >
              <span className="trace-method">{t.method}</span>
              <span className="trace-url" title={t.url}>
                {t.url}
              </span>
              <span className={statusClass(t)}>{t.status ?? 'ERR'}</span>
              <span className="trace-ms">{t.ms}ms</span>
            </button>
          </li>
        ))}
        {ordered.length === 0 && <li className="trace-empty">Sin peticiones todavía.</li>}
      </ul>
      {selected && (
        <div className="trace-detail">
          <h3>
            {selected.method} {selected.url}
          </h3>
          <p>
            Estado: <span className={statusClass(selected)}>{selected.status ?? 'ERR'}</span> · {selected.ms}ms ·{' '}
            {selected.at}
          </p>
          <h4>Cabeceras enviadas</h4>
          <pre>{pretty(selected.reqHeaders)}</pre>
          <h4>Cuerpo enviado</h4>
          <pre>{pretty(selected.reqBody)}</pre>
          <h4>Respuesta</h4>
          <pre>{pretty(selected.resBody)}</pre>
        </div>
      )}
    </div>
  );
}
