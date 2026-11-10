import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // عند تشغيل التطبيق لأول مرة، نتأكد من صحة التوكن الموجود
  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // تحديث بيانات المستخدم من السيرفر
          const freshData = await api.get('/auth/me');
          setUser((prev) => ({ ...prev, ...freshData }));
          localStorage.setItem('user', JSON.stringify({ ...JSON.parse(savedUser), ...freshData }));
        } catch (error) {
          console.error('Session expired or invalid:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  // دالة تسجيل الدخول
  const login = (authData) => {
    setToken(authData.token);
    setUser(authData);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData));
  };

  // دالة تسجيل الخروج
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // دالة تحديث بيانات المستخدم في الـ Context محلياً
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook مخصص لسهولة استدعاء السياق في أي مكان بـ useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};