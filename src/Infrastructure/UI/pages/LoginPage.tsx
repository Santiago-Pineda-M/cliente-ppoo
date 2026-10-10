import { LoginForm } from '@/Infrastructure/UI/components/organisms';
import styles from './LoginPage.module.css';

// Página delgada: solo monta el organismo. Sin PLOCs ni construcción inline.
export function LoginPage(): React.JSX.Element {
  return (
    <div className={styles.page}>
      <LoginForm />
    </div>
  );
}
