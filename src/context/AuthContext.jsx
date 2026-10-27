import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [connectedChannels, setConnectedChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await authService.getMe();
      if (res && res.data) {
        setUser(res.data.user);
        setConnectedChannels(res.data.connectedChannels || []);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      // If unauthorized, clear local data
      setUser(null);
      setConnectedChannels([]);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res && res.data) {
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      await fetchCurrentUser();
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await authService.register(name, email, password);
    if (res && res.data) {
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      await fetchCurrentUser();
    }
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setConnectedChannels([]);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const toggleWorker = async (targetState) => {
    try {
      const currentActive = user?.settings?.workerActive !== false;
      const nextState = targetState !== undefined ? Boolean(targetState) : !currentActive;
      const res = await api.patch('/dashboard/worker-toggle', { workerActive: nextState });
      
      setUser((prev) => {
        const updated = {
          ...prev,
          settings: {
            ...prev?.settings,
            workerActive: nextState,
            autoSchedulerEnabled: nextState,
          },
        };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });

      return res.data;
    } catch (err) {
      console.error('Failed to toggle worker:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        connectedChannels,
        loading,
        login,
        register,
        logout,
        refreshUserData,
        toggleWorker,
        workerActive: user?.settings?.workerActive !== false,
        isAuthenticated: !!user,
      }}
    >
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
