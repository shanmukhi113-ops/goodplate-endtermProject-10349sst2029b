
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api('/auth/me');
      setUser(data.user);
      return data.user;
    } catch {
      // Not logged in yet is okay.
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signup = async (values) => {
    const data = await api('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(values),
    });

    setUser(data.user);
    return data.user;
  };

  const login = async (values) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(values),
    });

    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signup,
      login,
      logout,
      refreshUser,
    }),
    [user, loading, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
}
