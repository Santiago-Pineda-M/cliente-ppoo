import { DependenciesProvider } from '@/Infrastructure/Context/DependenciesProvider';
import { MainLayout } from '@/Infrastructure/UI/layouts';
import { BootstrapPage, HomePage, LoginPage } from '@/Infrastructure/UI/pages';
import { useResolvedView } from '@/Infrastructure/UI/router';
import styles from './App.module.css';

// Composición raíz: SOLO re-renderiza la vista que resuelve el router.
// Prohibido decidir rutas, leer sesión o redirigir aquí: todo eso vive en
// `UI/router/` (registro + guards). Ver components/COMPONENT_RULES.md.
function Root(): React.JSX.Element {
  const { view, isLoading } = useResolvedView();

  if (isLoading) {
    return (
      <main className={styles.shell}>
        <p aria-busy="true">Cargando sesión…</p>
      </main>
    );
  }

  if (view === 'home') {
    return (
      <main className={styles.shell}>
        <HomePage />
      </main>
    );
  }

  return (
    <main className={`${styles.shell} ${styles.shellWide}`}>
      {view === 'bootstrap' ? <BootstrapPage /> : <LoginPage />}
    </main>
  );
}

export function App(): React.JSX.Element {
  return (
    <DependenciesProvider>
      <MainLayout>
        <Root />
      </MainLayout>
    </DependenciesProvider>
  );
}
