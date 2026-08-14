import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { useAuthStore } from '@/features/auth/stores/auth-store';
import { auth } from '@/lib/firebase';
import { queryClient } from '@/lib/query-client';

import { AppProvider } from './provider';
import { AppRouter } from './router';

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
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
