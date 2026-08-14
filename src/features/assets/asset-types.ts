import type { Timestamp } from 'firebase/firestore';

export type Asset = {
  id: string;
  description: string;
  created: Timestamp;
};
