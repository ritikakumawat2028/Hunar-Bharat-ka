import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up global request interceptor so every request dynamically carries the latest token
  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        config.headers['Authorization'] = `Bearer ${storedToken}`;
      }
      return config;
    });

    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // If token expired or invalid, log out cleanly
          if (error.config?.url?.includes('/api/users/me') || error.config?.url?.includes('/api/jobs/my')) {
            console.warn('Session expired, clearing authentication...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
          }
        }
        return Promise.reject(error);
      }
    );

    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, []);

  const login = async (phone, password, otp = null) => {
    try {
      const payload = { phone };
      if (otp) {
        payload.otp = otp;
      } else {
        payload.password = password;
      }

      const res = await axios.post('/api/auth/login', payload);
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      setUser(receivedUser);
      setToken(receivedToken);
      return { success: true, user: receivedUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'लॉगिन विफल रहा। कृपया विवरण पुनः जाँचें।'
      };
    }
  };

  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      setUser(receivedUser);
      setToken(receivedToken);
      return { success: true, user: receivedUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'पंजीकरण विफल रहा।'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const updateUserState = (updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUserState, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
