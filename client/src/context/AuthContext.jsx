import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    isLoading: true,
    user: null
  });

  const loadUser = async () => {
    // ... a função loadUser continua igual
    try {
      const res = await api.get('/auth');
      setAuthState({ ...authState, isAuthenticated: true, isLoading: false, user: res.data });
    } catch (err) {
      localStorage.removeItem('token');
      setAuthState({ token: null, isAuthenticated: false, isLoading: false, user: null });
    }
  };

  useEffect(() => { loadUser(); }, []);

  // FUNÇÃO DE LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      token: null,
      isAuthenticated: false,
      isLoading: false,
      user: null
    });
  };

  return (
    // Expor a função de logout para que os componentes a possam usar
    <AuthContext.Provider value={{ authState, logout }}>
      {children}
    </AuthContext.Provider>
  );
};