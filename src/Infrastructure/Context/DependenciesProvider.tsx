import { createContext, useContext } from 'react';
import type { IDependencies } from '@/Infrastructure/DI/DependenciesLocator';
import { dependenciesLocator } from '@/Infrastructure/DI/DependenciesLocator';

const DependenciesContext = createContext<IDependencies>(dependenciesLocator);

export function DependenciesProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <DependenciesContext.Provider value={dependenciesLocator}>{children}</DependenciesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook junto al provider a propósito (ver skill api-infrastructure)
export function useDependencies(): IDependencies {
  return useContext(DependenciesContext);
}
