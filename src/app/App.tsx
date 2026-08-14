import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { AppProviders } from './providers';
import { AppNavigator } from './navigation/AppNavigator';
import { useAuthStore } from '../features/auth/auth-store';
import { auth } from '../shared/lib/firebase';
import { queryClient } from '../shared/lib/query-client';

function useAuthenticationListener() {
  const setAuthState = useAuthStore((state) => state.setAuthState);

  useEffect(() => {
    let previousUserId = useAuthStore.getState().user?.uid ?? null;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const nextUserId = user?.uid ?? null;

      if (nextUserId !== previousUserId) {
        queryClient.removeQueries({ queryKey: ['assets'] });
        previousUserId = nextUserId;
      }

      setAuthState(user);
    });

    return unsubscribe;
  }, [setAuthState]);
}

export default function App() {
  useAuthenticationListener();

  return (
    <AppProviders>
      <AppNavigator />
    </AppProviders>
  );
}
