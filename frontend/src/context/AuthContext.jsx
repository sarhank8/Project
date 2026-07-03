import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on load
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('aab_e_hayat_token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error("Session expired or invalid token", error);
          localStorage.removeItem('aab_e_hayat_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login-json', { email, password, full_name: "" });
      const { access_token } = response.data;
      localStorage.setItem('aab_e_hayat_token', access_token);
      
      // Fetch user info
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
      return userResponse.data;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const register = async (email, password, fullName) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        full_name: fullName,
      });
      return response.data;
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('aab_e_hayat_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user, isAdmin: user?.is_admin }}>
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
