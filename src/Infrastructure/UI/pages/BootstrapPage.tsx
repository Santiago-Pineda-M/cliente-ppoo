import { Link } from '@/Infrastructure/UI/components/atoms';
import { BootstrapPanel } from '@/Infrastructure/UI/components/organisms';
import styles from './BootstrapPage.module.css';

// Página delgada: solo monta el organismo. Sin PLOCs ni construcción inline.
export function BootstrapPage(): React.JSX.Element {
  return (
    <div className={styles.page}>
      <nav aria-label="Volver">
        <Link href="#/login">← Volver al inicio de sesión</Link>
      </nav>
      <BootstrapPanel />
    </div>
  );
}
