import { History } from 'lucide-react';
import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import styles from './RecentActivity.module.css';

// Organismo: últimas peticiones HTTP registradas (lectura del drawer,
// sin ciclo de vida propio).
export function RecentActivity(): React.JSX.Element {
  const { httpTraceListPloc } = useDependencies();
  const state = usePlocState(httpTraceListPloc);
  const recent = [...state.traces].reverse().slice(0, 6);

  return (
    <section className={styles.panel} aria-label="Actividad reciente">
      <h2 className={styles.title}>
        <History size={18} aria-hidden="true" />
        Actividad reciente
      </h2>
      {recent.length === 0 ? (
        <p className={styles.empty} role="status">
          Sin peticiones todavía. La actividad HTTP aparecerá aquí.
        </p>
      ) : (
        <ul className={styles.list}>
          {recent.map((t) => (
            <li key={t.id} className={styles.row}>
              <span
                className={t.ok ? `${styles.dot} ${styles.dotOk}` : `${styles.dot} ${styles.dotErr}`}
                aria-hidden="true"
              />
              <span className={styles.method}>{t.method}</span>
              <span className={styles.url} title={t.url}>
                {t.url}
              </span>
              <span className={styles.ms}>{t.ms}ms</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
