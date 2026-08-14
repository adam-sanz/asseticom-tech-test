import { z } from 'zod';

export const assetDescriptionSchema = z
  .string()
  .trim()
  .min(1, 'Description is required.');
