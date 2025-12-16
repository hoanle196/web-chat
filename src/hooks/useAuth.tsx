'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, usersApi } from '@/lib/api';

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  avatar?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          setLoading(false);
          return;
        }

        const me = await usersApi.getMe();
        setUser(me);
      } catch {
        // Token invalid or API error -> clear token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleAuthSuccess = (data: { access_token: string; user: AuthUser }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.access_token);
    }
    setUser(data.user);
  };

  const login = async (username: string, password: string) => {
    const data = await authApi.login(username, password);
    handleAuthSuccess(data);
  };

  const register = async (username: string, password: string, name: string) => {
    const data = await authApi.register(username, password, name);
    handleAuthSuccess(data);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};



