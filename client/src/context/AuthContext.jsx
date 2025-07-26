// src/context/AuthContext.jsx

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

  // Esta função corre UMA VEZ no arranque da app
  useEffect(() => {
    const loadUserOnMount = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth');
          setAuthState({
            token,
            isAuthenticated: true,
            isLoading: false,
            user: res.data
          });
        } catch (err) {
          localStorage.removeItem('token');
          setAuthState({
            token: null,
            isAuthenticated: false,
            isLoading: false,
            user: null
          });
        }
      } else {
        setAuthState({
          token: null,
          isAuthenticated: false,
          isLoading: false,
          user: null
        });
      }
    };
    loadUserOnMount();
  }, []);

  // Função LOGIN completa e autónoma
  const login = async (email, password) => {
    try {
      // 1. Fazer o pedido de login para obter o token
      const res = await api.post('/users/login', { email, password });
      const token = res.data.token;
      localStorage.setItem('token', token);

      // 2. Com o novo token, ir buscar os dados do utilizador
      const userRes = await api.get('/auth'); // O interceptor vai usar o novo token

      // 3. Atualizar o estado com TODA a informação de uma só vez
      setAuthState({
        token,
        isAuthenticated: true,
        isLoading: false,
        user: userRes.data
      });
    } catch (err) {
      console.error("Falha no processo de login:", err);
      localStorage.removeItem('token');
      setAuthState({
        token: null,
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
    }
  };

  // Função LOGOUT
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
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};