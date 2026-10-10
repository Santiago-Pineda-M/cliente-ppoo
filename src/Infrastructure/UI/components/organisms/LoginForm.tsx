import { useEffect } from 'react';
import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { Alert, Button, Card, CardFoot, CardTitle, Field, Link } from '@/Infrastructure/UI/components/atoms';
import styles from './LoginForm.module.css';

// Organismo: formulario de acceso. Aquí VIVE la conexión a AuthPloc:
// la página solo lo monta, no le pasa datos.
export function LoginForm(): React.JSX.Element {
  const { authPloc } = useDependencies();
  const auth = usePlocState(authPloc);

  // Limpieza al salir SIN haber entrado. Si hay sesión activa (login
  // exitoso -> la app desmonta este formulario para mostrar el home),
  // no se toca: reset() borraría isAuthenticated y volvería al login
  // aunque el localStorage tenga sesión válida.
  useEffect(
    () => () => {
      if (!authPloc.state.isAuthenticated) authPloc.reset();
    },
    [authPloc],
  );

  return (
    <Card narrow labelledBy="login-title">
      <CardTitle id="login-title">Iniciar sesión</CardTitle>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          void authPloc.submit();
        }}
      >
        {auth.errors.general?.map((m) => (
          <Alert key={m} variant="error" title={m} />
        ))}
        <Field
          id="login-usuario"
          label="Usuario"
          value={auth.formData.login}
          autoComplete="username"
          required
          onChange={(v) => authPloc.updateField('login', v)}
        />
        <Field
          id="login-clave"
          label="Clave"
          type="password"
          value={auth.formData.password}
          autoComplete="current-password"
          required
          onChange={(v) => authPloc.updateField('password', v)}
        />
        <div className={styles.submit}>
          <Button type="submit" block disabled={auth.isSubmitting} label={auth.isSubmitting ? 'Entrando…' : 'Entrar'} />
        </div>
      </form>

      <CardFoot>
        <Link href="#/bootstrap">Ir a la inicialización del sistema →</Link>
      </CardFoot>
    </Card>
  );
}
