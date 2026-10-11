import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sharekart_token') || null);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load demo accounts for 1-click testing
  useEffect(() => {
    const fetchDemoUsers = async () => {
      try {
        const data = await api.getDemoUsers();
        if (data.success) {
          setDemoAccounts(data.demoAccounts);
        }
      } catch (err) {
        console.error('Failed to load demo accounts', err);
      }
    };

    fetchDemoUsers();
  }, []);

  // Fetch current user if token exists
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const data = await api.getMe();
          if (data.success) {
            setUser(data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Auth verification failed', err);
          // Don't log out if offline, keep current state if present
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const [currentLocation, setCurrentLocation] = useState(
    localStorage.getItem('sharekart_current_location') || 'Gandhinagar, Sector 7'
  );

  useEffect(() => {
    if (user?.location && !localStorage.getItem('sharekart_current_location')) {
      setCurrentLocation(user.location);
    }
  }, [user]);

  const updateLocation = (newLoc) => {
    localStorage.setItem('sharekart_current_location', newLoc);
    setCurrentLocation(newLoc);
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data.success) {
      localStorage.setItem('sharekart_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password, phone, location) => {
    const data = await api.register(name, email, password, phone, location);
    if (data.success) {
      localStorage.setItem('sharekart_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('sharekart_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoUser = (demoUser) => {
    localStorage.setItem('sharekart_token', demoUser.token);
    setToken(demoUser.token);
    setUser(demoUser);
  };

  const otpLogin = async (phone) => {
    const data = await api.otpLogin(phone);
    if (data.success) {
      localStorage.setItem('sharekart_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const updateUser = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  const updateProfile = async (profileData) => {
    const data = await api.updateProfile(profileData);
    if (data.success && data.user) {
      setUser(data.user);
      if (data.user.location) {
        setCurrentLocation(data.user.location);
        localStorage.setItem('sharekart_current_location', data.user.location);
      }
    }
    return data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await api.changePassword(currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      currentLocation,
      updateLocation,
      isAuthenticated: !!user,
      loading,
      demoAccounts,
      login,
      register,
      otpLogin,
      updateUser,
      updateProfile,
      changePassword,
      logout,
      switchDemoUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
