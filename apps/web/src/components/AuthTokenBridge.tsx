import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setAuthTokenGetter } from '../api/client';

/** Keeps the API client’s Bearer token in sync with the Clerk session. */
export function AuthTokenBridge({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
  }, [getToken]);

  return <>{children}</>;
}
