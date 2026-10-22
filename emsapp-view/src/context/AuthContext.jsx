import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../service/AuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => AuthService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial check on mount
    const savedUser = AuthService.getCurrentUser();
    const token = AuthService.getToken();
    if (savedUser && token) {
      setUser(savedUser);
    } else {
      setUser(null);
    }
    setLoading(false);

    // Global listener for 401 unauthorized events from api interceptor
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (username, password) => {
    const data = await AuthService.login(username, password);
    setUser(data);
    return data;
  };

  const signup = async (userData) => {
    const data = await AuthService.signup(userData);
    setUser(data);
    return data;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const role = user?.role || 'ROLE_EMPLOYEE';
  const isAdmin = role === 'ROLE_ADMIN';
  const isHR = role === 'ROLE_HR';
  const isEmployee = !isAdmin && !isHR;
  const canManageEmployees = isAdmin || isHR;
  const canManageLeaves = isAdmin || isHR;

  const value = {
    user,
    role,
    isAdmin,
    isHR,
    isEmployee,
    canManageEmployees,
    canManageLeaves,
    employeeId: user?.employeeId,
    isAuthenticated: !!user && !!AuthService.getToken(),
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
