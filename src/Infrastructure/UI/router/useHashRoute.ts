import { useCallback, useEffect, useState } from 'react';
import { getRouteFromHash, navigateTo, type AppRouteType } from './routes';

// Lee el hash actual. UI pura: no decide nada, solo observa.
export function useHashRoute(): { route: AppRouteType; navigate: (route: AppRouteType) => void } {
  const [route, setRoute] = useState<AppRouteType>(() =>
    typeof window === 'undefined' ? 'login' : getRouteFromHash(window.location.hash),
  );

  useEffect(() => {
    const onHashChange = (): void => {
      setRoute(getRouteFromHash(window.location.hash));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next: AppRouteType): void => {
    navigateTo(next);
  }, []);

  return { route, navigate };
}
