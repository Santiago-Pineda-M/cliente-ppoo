import { useEffect } from 'react';
import { DependenciesProvider, useDependencies } from './Infrastructure/Context/DependenciesProvider';
import { usePlocState } from './Infrastructure/Hooks/usePlocState';
import { MainLayout } from './Infrastructure/UI/layouts/MainLayout';

function Home(): React.JSX.Element {
  const { authPloc } = useDependencies();
  const auth = usePlocState(authPloc);

  useEffect(() => {
    void authPloc.checkSession();
    return () => authPloc.reset();
  }, [authPloc]);

  if (auth.isLoading) return <p>Cargando sesión…</p>;

  return (
    <>
      <h1>CLIENTE_PPOO</h1>
      {auth.isAuthenticated && auth.user ? (
        <>
          <p>
            Sesión: <strong>{auth.user.email}</strong>
          </p>
          <button
            type="button"
            onClick={() => {
              void authPloc.logout();
            }}
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void authPloc.submit();
          }}
        >
          <h2>Iniciar sesión</h2>
          {auth.errors.general?.map((m) => (
            <p key={m} role="alert">
              {m}
            </p>
          ))}
          <label>
            Usuario
            <input
              value={auth.formData.identifier}
              onChange={(e) => authPloc.updateField('identifier', e.target.value)}
              autoComplete="username"
            />
          </label>
          <label>
            Clave
            <input
              type="password"
              value={auth.formData.password}
              onChange={(e) => authPloc.updateField('password', e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button type="submit" disabled={auth.isSubmitting}>
            {auth.isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      )}
    </>
  );
}

export function App(): React.JSX.Element {
  return (
    <DependenciesProvider>
      <MainLayout>
        <main>
          <Home />
        </main>
      </MainLayout>
    </DependenciesProvider>
  );
}
