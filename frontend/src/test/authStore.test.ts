import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('starts unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('authenticates user correctly', () => {
    const mockUser = { id: 1, name: 'Admin', email: 'admin@manika.com', roles: [], permissions: [] };
    const mockToken = 'test-token';

    useAuthStore.getState().setUser(mockUser as any);
    useAuthStore.getState().setToken(mockToken);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
  });

  it('logs out user correctly', async () => {
    const mockUser = { id: 1, name: 'Admin', email: 'admin@manika.com', roles: [], permissions: [] };
    useAuthStore.getState().setUser(mockUser as any);
    useAuthStore.getState().setToken('token');

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});
