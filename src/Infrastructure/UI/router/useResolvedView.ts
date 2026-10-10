import { useEffect } from 'react';
import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { navigateTo, redirectFor, resolveView, type ResolvedViewType } from './routes';
import { useHashRoute } from './useHashRoute';

// Dueño de la protección de rutas (único lector de AuthPloc fuera de organisms):
// verifica la sesión al arrancar, redirige si la ruta no es accesible y expone
// la vista efectiva. Los componentes (App incluida) solo RE-RENDERIZAN
// este resultado: prohibido decidir rutas en ellos.
export function useResolvedView(): { view: ResolvedViewType; isLoading: boolean } {
  const { authPloc } = useDependencies();
  const auth = usePlocState(authPloc);
  const { route } = useHashRoute();

  useEffect(() => {
    void authPloc.checkSession();
  }, [authPloc]);

  useEffect(() => {
    if (auth.isLoading) return;
    const target = redirectFor(route, window.location.hash, auth.isAuthenticated);
    if (target) navigateTo(target);
  }, [auth.isLoading, auth.isAuthenticated, route]);

  return { view: resolveView(route, auth.isAuthenticated), isLoading: auth.isLoading };
}
