import { useEffect, useState } from 'react';
import type { Ploc } from '@/Domain';

export function usePlocState<S>(ploc: Ploc<S>): S {
  const [state, setState] = useState(ploc.state);

  useEffect(() => {
    const subscription = (newState: S): void => setState(newState);
    ploc.subscribe(subscription);
    return () => ploc.unsubscribe(subscription);
  }, [ploc]);

  return state;
}
