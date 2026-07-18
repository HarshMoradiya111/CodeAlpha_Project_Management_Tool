import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../api';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cpm_token') || '');
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('cpm_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('cpm_token', token);
    } else {
      localStorage.removeItem('cpm_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cpm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cpm_user');
    }
  }, [user]);

  async function register(payload) {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function login(payload) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    setToken('');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: Boolean(token), register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };