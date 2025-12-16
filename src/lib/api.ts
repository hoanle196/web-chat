import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  register: async (username: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { username, password, name });
    return response.data;
  },
};

export const chatApi = {
  getRooms: async () => {
    const response = await api.get('/chat/rooms');
    return response.data;
  },
  createRoom: async (userId: number) => {
    const response = await api.post('/chat/rooms', { userId });
    return response.data;
  },
  getMessages: async (roomId: number, limit?: number) => {
    const response = await api.get(`/chat/rooms/${roomId}/messages`, {
      params: { limit },
    });
    return response.data;
  },
};

export const usersApi = {
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  saveDeviceToken: async (token: string, platform: string) => {
    const response = await api.post('/users/device-token', { token, platform });
    return response.data;
  },
};
