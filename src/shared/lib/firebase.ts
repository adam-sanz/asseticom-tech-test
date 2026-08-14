import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseError, getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Persistence,
  type ReactNativeAsyncStorage,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { firebaseConfig } from '../../config/env';

declare module 'firebase/auth' {
  export function getReactNativePersistence(
    storage: ReactNativeAsyncStorage,
  ): Persistence;
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function createAuth() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/already-initialized') {
      return getAuth(app);
    }

    throw error;
  }
}

const auth = createAuth();
const db = getFirestore(app);

export { app, auth, db };
