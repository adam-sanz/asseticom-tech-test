import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

import { auth } from '../../shared/lib/firebase';

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}
