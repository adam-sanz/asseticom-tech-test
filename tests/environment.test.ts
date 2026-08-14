import { afterEach, describe, expect, it, vi } from 'vitest';

const validEnvironment = {
  EXPO_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test.firebasestorage.app',
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456789',
  EXPO_PUBLIC_FIREBASE_APP_ID: '1:123456789:web:test',
} as const;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('Firebase environment configuration', () => {
  it('loads when all required values are present', async () => {
    for (const [name, value] of Object.entries(validEnvironment)) {
      vi.stubEnv(name, value);
    }

    const { firebaseConfig } = await import('@/config/env');

    expect(firebaseConfig).toEqual({
      apiKey: validEnvironment.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: validEnvironment.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: validEnvironment.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: validEnvironment.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: validEnvironment.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: validEnvironment.EXPO_PUBLIC_FIREBASE_APP_ID,
    });
  });

  it('reports the required variable when a value is missing', async () => {
    for (const [name, value] of Object.entries(validEnvironment)) {
      vi.stubEnv(name, name === 'EXPO_PUBLIC_FIREBASE_PROJECT_ID' ? '' : value);
    }

    await expect(import('@/config/env')).rejects.toThrow('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  });
});
