import { describe, expect, it } from 'vitest';

import { assetDescriptionSchema } from '@/features/assets/api/asset-schema';

describe('asset description validation', () => {
  it('trims a valid description', () => {
    expect(assetDescriptionSchema.parse('  Laptop  ')).toBe('Laptop');
  });

  it('rejects an empty or spaces-only description', () => {
    expect(() => assetDescriptionSchema.parse('   ')).toThrow('Description is required.');
  });
});
