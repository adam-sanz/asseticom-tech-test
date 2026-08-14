import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';

import { assetDescriptionSchema } from './asset-schema';
import type { Asset } from './asset-types';
import { db } from '../../shared/lib/firebase';

const assetsCollection = collection(db, 'assets');

export async function getAssets(): Promise<Asset[]> {
  const snapshot = await getDocs(
    query(assetsCollection, orderBy('created', 'desc')),
  );

  return snapshot.docs.map((document) => {
    const data = document.data();

    return {
      id: document.id,
      description: data.description as string,
      created: data.created as Timestamp,
    };
  });
}

export function createAsset(description: string) {
  const validatedDescription = assetDescriptionSchema.parse(description);

  return addDoc(assetsCollection, {
    description: validatedDescription,
    created: serverTimestamp(),
  });
}
