import type { User } from 'firebase/auth';
import { create } from 'zustand';

type AuthState = {
  user: User | null;
  isInitialLoading: boolean;
  setAuthState: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialLoading: true,
  setAuthState: (user) => set({ user, isInitialLoading: false }),
}));
