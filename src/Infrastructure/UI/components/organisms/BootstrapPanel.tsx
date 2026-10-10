import { useEffect, useState } from 'react';
import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { Alert, Button, Card, CardTitle, Link } from '@/Infrastructure/UI/components/atoms';
import { CredentialsList } from '@/Infrastructure/UI/components/molecules';
import styles from './BootstrapPanel.module.css';

// Organismo: siembra inicial (POST /bootstrap/admin, público). Muestra una
// sola vez las credenciales; si el sistema ya existe muestra el estado
// "ya inicializado" en vez de un error.
export function BootstrapPanel(): React.JSX.Element {
  const { usersPloc } = useDependencies();
  const s = usePlocState(usersPloc);
  const [copied, setCopied] = useState(false);

  useEffect(() => () => usersPloc.reset(), [usersPloc]);

  async function copyCredentials(): Promise<void> {
    if (!s.bootstrap) return;
    const text = `Usuario: ${s.bootstrap.login}\nClave: ${s.bootstrap.passwordGenerada}\nAPI key: ${s.bootstrap.apiKey}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card labelledBy="bootstrap-title">
      <CardTitle id="bootstrap-title" xl>
        Inicialización del sistema
      </CardTitle>

      {s.bootstrap ? (
        <Alert variant="success" title="Sistema inicializado. Guarda estas credenciales." note="No se volverán a mostrar.">
          <CredentialsList
            entries={[
              { label: 'Usuario', value: s.bootstrap.login },
              { label: 'Clave generada', value: s.bootstrap.passwordGenerada, secret: true },
              { label: 'API key', value: s.bootstrap.apiKey, secret: true },
            ]}
          />
          <div className={styles.actions}>
            <Button
              label={copied ? '¡Copiado!' : 'Copiar credenciales'}
              onClick={() => {
                void copyCredentials();
              }}
            />
            <Link href="#/login">Ir al inicio de sesión</Link>
          </div>
        </Alert>
      ) : s.alreadyBootstrapped ? (
        <Alert variant="muted" title="El sistema ya fue inicializado." note="Usa tus credenciales para entrar.">
          <div className={styles.actions}>
            <Link href="#/login">Ir al inicio de sesión</Link>
          </div>
        </Alert>
      ) : (
        <>
          {s.errors.general?.map((m) => (
            <Alert key={m} variant="error" title={m} />
          ))}
          <div className={styles.actions}>
            <Button
              label={s.isLoading ? 'Inicializando…' : 'Inicializar sistema'}
              disabled={s.isLoading}
              onClick={() => {
                void usersPloc.bootstrap();
              }}
            />
          </div>
        </>
      )}
    </Card>
  );
}
