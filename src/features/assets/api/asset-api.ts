import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';

import { db } from '@/lib/firebase';

import { assetDescriptionSchema } from './asset-schema';
import type { Asset } from '../types/asset';

const assetsCollection = collection(db, 'assets');

export async function getAssets(): Promise<Asset[]> {
  const snapshot = await getDocs(query(assetsCollection, orderBy('created', 'desc')));

  return snapshot.docs.map((document) => {
    const data = document.data();

    return {
      id: document.id,
      description: data.description as string,
      created: data.created as Timestamp,
    };
  });
}

export async function getAsset(assetId: string): Promise<Asset | null> {
  const snapshot = await getDoc(doc(assetsCollection, assetId));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    description: data.description as string,
    created: data.created as Timestamp,
  };
}

export function createAsset(description: string) {
  const validatedDescription = assetDescriptionSchema.parse(description);

  return addDoc(assetsCollection, {
    description: validatedDescription,
    created: serverTimestamp(),
  });
}

export function updateAsset(assetId: string, description: string) {
  const validatedDescription = assetDescriptionSchema.parse(description);

  return updateDoc(doc(assetsCollection, assetId), {
    description: validatedDescription,
  });
}

export function deleteAsset(assetId: string) {
  return deleteDoc(doc(assetsCollection, assetId));
}
