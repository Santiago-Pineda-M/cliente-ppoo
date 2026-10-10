import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { Button, Card, CardMeta, CardTitle } from '@/Infrastructure/UI/components/atoms';
import styles from './SessionCard.module.css';

// Organismo: tarjeta de sesión activa. La sesión ya fue verificada en App.
export function SessionCard(): React.JSX.Element {
  const { authPloc } = useDependencies();
  const auth = usePlocState(authPloc);

  if (!auth.isAuthenticated || !auth.user) return <p role="status">Sesión no disponible.</p>;

  const fullName = `${auth.user.nombres} ${auth.user.apellidos}`.trim();

  return (
    <Card labelledBy="home-title">
      <CardTitle id="home-title">CLIENTE_PPOO</CardTitle>
      <CardMeta>
        Sesión: <strong className={styles.login}>{auth.user.login}</strong>
        {fullName ? ` (${fullName})` : ''}
        {' · '}
        {auth.user.role}
      </CardMeta>
      <div className={styles.actions}>
        <Button
          variant="ghost"
          label="Cerrar sesión"
          onClick={() => {
            void authPloc.logout();
          }}
        />
      </div>
    </Card>
  );
}
