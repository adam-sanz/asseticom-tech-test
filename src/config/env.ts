import { z } from 'zod';

const requiredConfigValue = z.string().trim().min(1);

const firebaseConfigSchema = z.object({
  apiKey: requiredConfigValue,
  authDomain: requiredConfigValue,
  projectId: requiredConfigValue,
  storageBucket: requiredConfigValue,
  messagingSenderId: requiredConfigValue,
  appId: requiredConfigValue,
});

const environmentVariableNames = {
  apiKey: 'EXPO_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'EXPO_PUBLIC_FIREBASE_APP_ID',
} as const;

const result = firebaseConfigSchema.safeParse({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
});

if (!result.success) {
  const fields = result.error.issues
    .map((issue) => {
      const field = issue.path[0];

      return (
        environmentVariableNames[field as keyof typeof environmentVariableNames] ??
        String(field)
      );
    })
    .join(', ');

  throw new Error(
    `Missing Firebase client configuration. Set these Expo public values: ${fields}.`,
  );
}

export const firebaseConfig = result.data;
