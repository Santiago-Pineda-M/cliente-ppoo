import { DependenciesProvider } from '@/Infrastructure/Context/DependenciesProvider';
import { MainLayout } from '@/Infrastructure/UI/layouts';
import {
  BootstrapPage,
  ConsultaPage,
  ConductorPage,
  HomePage,
  LoginPage,
  PersonaPage,
  TipoDocumentoPage,
  UsuarioPage,
  VehiculoPage,
} from '@/Infrastructure/UI/pages';
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

  // Rutas públicas / de sesión: no llevan MainLayout (SideNav solo con sesión).
  if (view === 'login' || view === 'bootstrap') {
    return (
      <main className={`${styles.shell} ${styles.shellWide} `}>
        {view === 'bootstrap' ? <BootstrapPage /> : <LoginPage />}
      </main>
    );
  }

  // Rutas privadas: van dentro de MainLayout (con SideNav).
  const page = (): React.JSX.Element => {
    switch (view) {
      case 'home':
        return <HomePage />;
      case 'personas':
        return <PersonaPage />;
      case 'vehiculos':
        return <VehiculoPage />;
      case 'conductores':
        return <ConductorPage />;
      case 'consultas':
        return <ConsultaPage />;
      case 'tipos-documento':
        return <TipoDocumentoPage />;
      case 'usuarios':
        return <UsuarioPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <main className={styles.shell}>
      <MainLayout>{page()}</MainLayout>
    </main>
  );
}

export function App(): React.JSX.Element {
  return (
    <DependenciesProvider>
      <Root />
    </DependenciesProvider>
  );
}
