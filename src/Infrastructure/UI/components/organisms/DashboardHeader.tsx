import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import styles from './DashboardHeader.module.css';

// Organismo: encabezado del tablero con el usuario de la sesión.
export function DashboardHeader(): React.JSX.Element | null {
  const { authPloc } = useDependencies();
  const auth = usePlocState(authPloc);

  if (!auth.isAuthenticated || !auth.user) return null;
  const fullName = `${auth.user.nombres} ${auth.user.apellidos}`.trim();

  return (
    <div className={styles.header}>
      <h1 className={styles.title}>Hola, {fullName || auth.user.login}</h1>
      <p className={styles.meta}>
        {auth.user.role} · {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
    </div>
  );
}
