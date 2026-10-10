import { useEffect } from 'react';
import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { HttpTracePanel, SideNav } from '@/Infrastructure/UI/components/organisms';
import styles from './MainLayout.module.css';
import traceStyles from '@/Infrastructure/UI/components/organisms/HttpTracePanel.module.css';

export function MainLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { appConfig, httpTraceListPloc } = useDependencies();
  const traceState = usePlocState(httpTraceListPloc);

  useEffect(() => {
    httpTraceListPloc.attach();
    return () => httpTraceListPloc.detachService();
  }, [httpTraceListPloc]);

  return (
    <div className={styles.layout}>
      <SideNav />
      <div className={styles.main}>{children}</div>
      {appConfig.httpTraceEnabled && traceState.isOpen && (
        <aside className={styles.drawer}>
          <HttpTracePanel />
        </aside>
      )}
      {appConfig.httpTraceEnabled && !traceState.isOpen && (
        <button
          type="button"
          className={traceStyles.fab}
          onClick={() => httpTraceListPloc.toggle()}
          title="Ver peticiones HTTP"
        >
          HTTP
        </button>
      )}
    </div>
  );
}
