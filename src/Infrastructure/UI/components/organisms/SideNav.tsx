import {
  CarFront,
  FileSearch,
  Files,
  LayoutDashboard,
  LogOut,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { routeToHash, useHashRoute } from '@/Infrastructure/UI/router';
import styles from './SideNav.module.css';

interface NavEntryType {
  label: string;
  icon: LucideIcon;
  /** null = módulo futuro: se muestra deshabilitado con badge, sin href roto. */
  to: string | null;
}

const ENTRIES: NavEntryType[] = [
  { label: 'Inicio', icon: LayoutDashboard, to: '#/' },
  { label: 'Personas', icon: Users, to: '#/personas' },
  { label: 'Vehículos', icon: CarFront, to: '#/vehiculos' },
  { label: 'Conductores', icon: Truck, to: '#/conductores' },
  { label: 'Consultas', icon: FileSearch, to: '#/consultas' },
  { label: 'Tipos de documento', icon: Files, to: '#/tipos-documento' },
  { label: 'Usuarios', icon: Users, to: '#/usuarios' },
];

// Organismo: navegación lateral. Visible solo con sesión (el layout la monta
// siempre y este organismo decide). Activo según el hash actual.
export function SideNav(): React.JSX.Element | null {
  const { authPloc } = useDependencies();
  const auth = usePlocState(authPloc);
  const { route } = useHashRoute();

  if (!auth.isAuthenticated || !auth.user) return null;
  const fullName = `${auth.user.nombres} ${auth.user.apellidos}`.trim();

  return (
    <nav className={styles.sidenav} aria-label="Principal">
      <p className={styles.brand} aria-hidden="true">
        PP
      </p>
      <ul className={styles.list}>
        {ENTRIES.map((e) => {
          const Icon = e.icon;
          const active = e.to !== null && routeToHash(route) === e.to;
          return (
            <li key={e.label}>
              {e.to ? (
                <a
                  href={e.to}
                  aria-current={active ? 'page' : undefined}
                  className={active ? `${styles.item} ${styles.itemActive}` : styles.item}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span className={styles.label}>{e.label}</span>
                </a>
              ) : (
                <span className={`${styles.item} ${styles.itemDisabled}`} aria-disabled="true" title="Próximamente">
                  <Icon size={18} aria-hidden="true" />
                  <span className={styles.label}>{e.label}</span>
                  <span className={styles.badge}>Pronto</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div className={styles.foot}>
        <p className={styles.user}>
          <strong className={styles.userName}>{auth.user.login}</strong>
          {fullName ? <span>{fullName}</span> : null}
        </p>
        <button
          type="button"
          className={styles.logout}
          onClick={() => {
            void authPloc.logout();
          }}
        >
          <LogOut size={18} aria-hidden="true" />
          <span className={styles.label}>Salir</span>
        </button>
      </div>
    </nav>
  );
}
