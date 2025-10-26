import { describe, it, expect, beforeEach, vi } from 'vitest';
import useUserStore from './userStore';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock;

describe('userStore - Guest Mode', () => {
  beforeEach(() => {
    // Reset store to initial state
    const store = useUserStore.getState();
    localStorage.clear();
    store.user = null;
    store.token = null;
    store.isAuthenticated = false;
    store.isGuest = false;
    store.loading = false;
    store.error = null;
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isGuest).toBe(false);
      expect(state.loading).toBe(false);
    });
  });

  describe('setGuestMode', () => {
    it('should set guest mode correctly', () => {
      const store = useUserStore.getState();
      store.setGuestMode();
      
      const state = useUserStore.getState();
      expect(state.isGuest).toBe(true);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeDefined();
      expect(state.user.username).toBe('Guest');
      expect(state.user.id).toMatch(/^guest-\d+$/);
    });

    it('should generate unique guest IDs', () => {
      const store = useUserStore.getState();
      
      store.setGuestMode();
      const firstGuestId = useUserStore.getState().user.id;
      
      // Wait a bit to ensure different timestamp
      vi.useFakeTimers();
      vi.advanceTimersByTime(10);
      
      // Reset and create new guest
      store.user = null;
      store.isGuest = false;
      store.setGuestMode();
      const secondGuestId = useUserStore.getState().user.id;
      
      expect(firstGuestId).not.toBe(secondGuestId);
      vi.useRealTimers();
    });

    it('should not affect localStorage', () => {
      const store = useUserStore.getState();
      store.setGuestMode();
      
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear guest mode on logout', () => {
      const store = useUserStore.getState();
      
      // Set guest mode first
      store.setGuestMode();
      expect(useUserStore.getState().isGuest).toBe(true);
      
      // Then logout
      store.logout();
      
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.isGuest).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.token).toBeNull();
    });

    it('should clear token from localStorage on logout', () => {
      const store = useUserStore.getState();
      
      // Simulate having a token
      localStorage.setItem('auth_token', 'fake-token');
      
      store.logout();
      
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('guest vs authenticated state', () => {
    it('should distinguish between guest and authenticated users', () => {
      const store = useUserStore.getState();
      
      // Guest user
      store.setGuestMode();
      let state = useUserStore.getState();
      expect(state.isGuest).toBe(true);
      expect(state.isAuthenticated).toBe(false);
      
      // Clear guest mode first
      store.logout();
      
      // Authenticated user (simulated - set via the store's setState method)
      useUserStore.setState({
        user: { id: '123', username: 'TestUser' },
        isAuthenticated: true,
        isGuest: false
      });
      state = useUserStore.getState();
      expect(state.isGuest).toBe(false);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('guest user properties', () => {
    it('should have a guest user with correct properties', () => {
      const store = useUserStore.getState();
      store.setGuestMode();
      
      const state = useUserStore.getState();
      expect(state.user).toHaveProperty('username');
      expect(state.user).toHaveProperty('id');
      expect(state.user.username).toBe('Guest');
      expect(typeof state.user.id).toBe('string');
    });
  });
});
