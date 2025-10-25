import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (username, email, password) => {
    const response = await api.post('/api/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  updateProfile: async (username, avatar) => {
    const response = await api.put('/api/auth/profile', {
      username,
      avatar,
    });
    return response.data;
  },

  getUser: async (userId) => {
    const response = await api.get(`/api/auth/user/${userId}`);
    return response.data;
  },
};

// Game History API
export const gameHistoryAPI = {
  saveGame: async (gameData) => {
    const response = await api.post('/api/games', gameData);
    return response.data;
  },

  getGames: async (page = 1, limit = 20) => {
    const response = await api.get('/api/games', {
      params: { page, limit },
    });
    return response.data;
  },

  getGame: async (gameId) => {
    const response = await api.get(`/api/games/${gameId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/games/stats/summary');
    return response.data;
  },
};

export default api;
