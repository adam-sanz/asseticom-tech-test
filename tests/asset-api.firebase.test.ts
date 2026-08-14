import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';

import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  inMemoryPersistence,
  initializeAuth,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { deleteDoc, getFirestore, Timestamp, type DocumentReference, type Firestore } from 'firebase/firestore';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

const environmentFile = resolve(process.cwd(), '.env');

if (existsSync(environmentFile)) {
  loadEnvFile(environmentFile);
}

const hasFirebaseEnvironment = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
].every((name) => process.env[name]?.trim());

const describeWithFirebase = hasFirebaseEnvironment ? describe : describe.skip;

describeWithFirebase('asset API against the Firebase test project', () => {
  let app: FirebaseApp | undefined;
  let auth: Auth | undefined;
  let db: Firestore;
  let user: User | undefined;
  let assetReference: DocumentReference | undefined;
  let createAsset: typeof import('@/features/assets/api/asset-api').createAsset;
  let getAsset: typeof import('@/features/assets/api/asset-api').getAsset;
  let updateAsset: typeof import('@/features/assets/api/asset-api').updateAsset;
  let deleteAsset: typeof import('@/features/assets/api/asset-api').deleteAsset;

  beforeAll(async () => {
    const { firebaseConfig } = await import('@/config/env');
    const testId = randomUUID().replaceAll('-', '');

    app = initializeApp(firebaseConfig, `asseticom-live-test-${testId}`);
    auth = initializeAuth(app, { persistence: inMemoryPersistence });
    db = getFirestore(app);

    vi.doMock('@/lib/firebase', () => ({ db }));

    const credential = await createUserWithEmailAndPassword(
      auth,
      `asseticom-test-${testId}@example.invalid`,
      `Asseticom-${testId}-test`,
    );
    user = credential.user;

    ({ createAsset, getAsset, updateAsset, deleteAsset } = await import('@/features/assets/api/asset-api'));
  });

  afterEach(async () => {
    if (assetReference) {
      await deleteDoc(assetReference);
      assetReference = undefined;
    }
  });

  afterAll(async () => {
    try {
      await Promise.all([
        assetReference ? deleteDoc(assetReference) : Promise.resolve(),
        user ? deleteUser(user) : Promise.resolve(),
      ]);
    } finally {
      if (auth?.currentUser) {
        await signOut(auth);
      }

      if (app) {
        await deleteApp(app);
      }
    }
  });

  it('creates an asset with a server timestamp', async () => {
    const testId = randomUUID().replaceAll('-', '');
    const assetDescription = `asseticom-test-${testId}`;

    assetReference = await createAsset(assetDescription);

    const createdAsset = await getAsset(assetReference.id);

    expect(createdAsset?.id).toBe(assetReference.id);
    expect(createdAsset?.description).toBe(assetDescription);
    expect(createdAsset?.created).toBeInstanceOf(Timestamp);
  });

  it('reads a created asset', async () => {
    const testId = randomUUID().replaceAll('-', '');
    const assetDescription = `asseticom-test-${testId}`;

    assetReference = await createAsset(assetDescription);

    const asset = await getAsset(assetReference.id);

    expect(asset?.id).toBe(assetReference.id);
    expect(asset?.description).toBe(assetDescription);
    expect(asset?.created).toBeInstanceOf(Timestamp);
  });

  it('updates the description without changing the creation time', async () => {
    const testId = randomUUID().replaceAll('-', '');
    const assetDescription = `asseticom-test-${testId}`;

    assetReference = await createAsset(assetDescription);

    const createdAsset = await getAsset(assetReference.id);

    if (!createdAsset) {
      throw new Error('The created asset could not be read back.');
    }

    await updateAsset(assetReference.id, `${assetDescription}-updated`);

    const updatedAsset = await getAsset(assetReference.id);

    expect(updatedAsset).not.toBeNull();
    expect(updatedAsset?.description).toBe(`${assetDescription}-updated`);
    expect(updatedAsset?.created).toBeInstanceOf(Timestamp);
    expect(updatedAsset?.created.toMillis()).toBe(createdAsset.created.toMillis());
  });

  it('deletes an asset', async () => {
    const testId = randomUUID().replaceAll('-', '');
    const assetDescription = `asseticom-test-${testId}`;

    assetReference = await createAsset(assetDescription);
    const assetId = assetReference.id;

    await deleteAsset(assetId);
    assetReference = undefined;

    expect(await getAsset(assetId)).toBeNull();
  });
});
