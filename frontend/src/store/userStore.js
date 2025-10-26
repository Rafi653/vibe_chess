import { create } from 'zustand';
import { authAPI } from '../services/api';

const useUserStore = create((set) => ({
  // User state
  user: null,
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: false,
  isGuest: false,
  loading: false,
  error: null,

  // Actions
  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authAPI.register(username, email, password);
      localStorage.setItem('auth_token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('auth_token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
    });
  },

  // Guest mode
  setGuestMode: () => {
    set({
      user: {
        username: 'Guest',
        id: `guest-${Date.now()}`,
      },
      isGuest: true,
      isAuthenticated: false,
    });
  },

  loadUser: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    set({ loading: true });
    try {
      const data = await authAPI.getProfile();
      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  updateProfile: async (username, avatar) => {
    set({ loading: true, error: null });
    try {
      const data = await authAPI.updateProfile(username, avatar);
      set({
        user: data.user,
        loading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Update failed';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useUserStore;
