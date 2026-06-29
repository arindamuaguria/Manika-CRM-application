import { describe, it, expect, vi } from 'vitest';
import { usePermission } from '@/hooks';
import { useAuthStore } from '@/store/authStore';

// Mock the auth store
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('usePermission hook', () => {
  it('returns true for can if user has permission', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        permissions: ['leads.create'],
        roles: [{ name: 'BDM' }],
      },
      hasPermission: (p: string) => p === 'leads.create',
      hasRole: (r: string) => r === 'BDM',
    } as any);

    const { can } = usePermission();
    expect(can('leads.create')).toBe(true);
    expect(can('deals.approve')).toBe(false);
  });

  it('returns true for hasRole if user has role', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        permissions: [],
        roles: [{ name: 'BDM' }],
      },
      hasPermission: () => false,
      hasRole: (r: string) => r === 'BDM',
    } as any);

    const { is } = usePermission();
    expect(is('BDM')).toBe(true);
    expect(is('Admin')).toBe(false);
  });
});
