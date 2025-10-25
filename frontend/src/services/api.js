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

// Friends API
export const friendsAPI = {
  sendRequest: async (recipientId) => {
    const response = await api.post('/api/friends/request', { recipientId });
    return response.data;
  },

  acceptRequest: async (friendshipId) => {
    const response = await api.post(`/api/friends/accept/${friendshipId}`);
    return response.data;
  },

  declineRequest: async (friendshipId) => {
    const response = await api.post(`/api/friends/decline/${friendshipId}`);
    return response.data;
  },

  getFriends: async () => {
    const response = await api.get('/api/friends');
    return response.data;
  },

  getRequests: async () => {
    const response = await api.get('/api/friends/requests');
    return response.data;
  },

  removeFriend: async (friendId) => {
    const response = await api.delete(`/api/friends/${friendId}`);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get('/api/friends/search', {
      params: { query },
    });
    return response.data;
  },
};

export default api;
