import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('ticketbooking_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ticketbooking_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('ticketbooking_admin_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/admin/auth/me');
        if (res.data.success && res.data.data?.admin) {
          setAdmin(res.data.data.admin);
          localStorage.setItem('ticketbooking_admin_user', JSON.stringify(res.data.data.admin));
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/admin/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, admin: receivedAdmin } = res.data.data;
      setToken(receivedToken);
      setAdmin(receivedAdmin);
      localStorage.setItem('ticketbooking_admin_token', receivedToken);
      localStorage.setItem('ticketbooking_admin_user', JSON.stringify(receivedAdmin));
      return receivedAdmin;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/admin/auth/logout');
      }
    } catch (e) {
      // Ignore logout errors
    } finally {
      setToken(null);
      setAdmin(null);
      localStorage.removeItem('ticketbooking_admin_token');
      localStorage.removeItem('ticketbooking_admin_user');
    }
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
