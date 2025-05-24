import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          const user = JSON.parse(storedUserInfo);
          setUserInfo(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra xác thực:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkAuthentication();
  }, []);

  const login = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUserInfo(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...userData }));
    setUserInfo(prev => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userInfo,
      loading,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
