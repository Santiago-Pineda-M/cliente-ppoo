import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { Button } from '@/Infrastructure/UI/components/atoms';
import { Field } from '@/Infrastructure/UI/components/atoms';
import { Alert } from '@/Infrastructure/UI/components/atoms';
import styles from './UsuarioPage.module.css';

// Página delgada: mi perfil y seguridad (perfil, cambio de contraseña, API key) vía usersPloc.
// También incluye bootstrap del administrador inicial.
export function UsuarioPage(): React.JSX.Element {
  const { usersPloc } = useDependencies();
  const s = usePlocState(usersPloc);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mi perfil y seguridad</h1>
      {s.errors.general && (
        <Alert variant="error" title="Error" note={s.errors.general.join(' · ')} />
      )}

      <section className={styles.card}>
        <h2>Mi perfil</h2>
        <div className={styles.actions}>
          <Button
            label={s.isLoading ? 'Cargando…' : 'Cargar perfil'}
            variant="primary"
            type="button"
            onClick={() => void usersPloc.loadCurrentUser()}
            disabled={s.isLoading}
          />
        </div>
        {s.currentUser && (
          <div>
            <p><strong>ID:</strong> {s.currentUser.id}</p>
            <p><strong>Login:</strong> {s.currentUser.login}</p>
            <p><strong>Nombres:</strong> {s.currentUser.nombres}</p>
            <p><strong>Apellidos:</strong> {s.currentUser.apellidos}</p>
            <p><strong>Rol:</strong> {s.currentUser.role}</p>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2>Cambiar mi contraseña</h2>
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void usersPloc.submit(); }}>
          <Field
            id="login"
            label="Login"
            value={s.formData.login}
            onChange={(v) => usersPloc.updateField('login', v)}
          />
          <Field
            id="newPassword"
            label="Nueva contraseña"
            type="password"
            value={s.formData.newPassword}
            onChange={(v) => usersPloc.updateField('newPassword', v)}
          />
          <Button
            label={s.isLoading ? 'Cambiando…' : 'Cambiar contraseña'}
            variant="primary"
            type="submit"
            disabled={s.isLoading}
          />
        </form>
      </section>

      <section className={styles.card}>
        <h2>API Key</h2>
        <div className={styles.actions}>
          <Field
            id="loginKey"
            label="Login"
            value={s.formData.login}
            onChange={(v) => usersPloc.updateField('login', v)}
          />
          <Button
            label={s.isLoading ? 'Regenerando…' : 'Regenerar API Key'}
            variant="primary"
            type="button"
            onClick={() => void usersPloc.regenerateKey()}
            disabled={s.isLoading}
          />
        </div>
        {s.regeneratedKey && (
          <div className={styles.alertWarn}>
            <p><strong>Nueva API Key:</strong> {s.regeneratedKey.apiKey}</p>
            <p className={styles.warn}>
              ⚠ Advertencia: al regenerar, la clave anterior deja de funcionar.
            </p>
          </div>
        )}
      </section>

      {(s.bootstrap || s.alreadyBootstrapped) && (
        <section className={styles.card}>
          <h2>Administrador inicial</h2>
          <div className={styles.actions}>
            <Button
              label={
                s.isLoading
                  ? 'Inicializando…'
                  : s.alreadyBootstrapped
                    ? 'Ya inicializado'
                    : 'Inicializar administrador'
              }
              variant="primary"
              type="button"
              onClick={() => void usersPloc.bootstrap()}
              disabled={s.isLoading || s.alreadyBootstrapped}
            />
          </div>
          {s.bootstrap && (
            <div>
              <p><strong>personaId:</strong> {s.bootstrap.personaId}</p>
              <p><strong>login:</strong> {s.bootstrap.login}</p>
              <p><strong>contraseña generada:</strong> {s.bootstrap.passwordGenerada}</p>
              <p><strong>apiKey:</strong> {s.bootstrap.apiKey}</p>
            </div>
          )}
          {s.alreadyBootstrapped && <p>El sistema ya fue inicializado.</p>}
        </section>
      )}
    </div>
  );
}
