import { useEffect } from 'react';
import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { HttpTracePanel } from '@/Infrastructure/UI/components/HttpTracePanel';

export function MainLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { appConfig, httpTraceListPloc } = useDependencies();
  const traceState = usePlocState(httpTraceListPloc);

  useEffect(() => {
    httpTraceListPloc.attach();
    return () => httpTraceListPloc.detachService();
  }, [httpTraceListPloc]);

  return (
    <div className="layout">
      <div className="layout__main">{children}</div>
      {appConfig.httpTraceEnabled && traceState.isOpen && (
        <aside className="layout__drawer">
          <HttpTracePanel />
        </aside>
      )}
      {appConfig.httpTraceEnabled && !traceState.isOpen && (
        <button type="button" className="trace-fab" onClick={() => httpTraceListPloc.toggle()} title="Ver peticiones HTTP">
          HTTP
        </button>
      )}
    </div>
  );
}
