import { describe, it, expect } from 'vitest';
import { cn } from '@/utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('handles conditional class names', () => {
    expect(cn('bg-red-500', false && 'text-white', true && 'font-bold')).toBe('bg-red-500 font-bold');
  });

  it('resolves Tailwind conflicts correctly', () => {
    expect(cn('p-4 p-8')).toBe('p-8');
  });
});
