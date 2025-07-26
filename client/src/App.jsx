// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute'; // 1. Importar
import HomePage from './pages/HomePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} /> // Rota principal
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={ <PrivateRoute role="seller"><Dashboard /></PrivateRoute> } />
    </Routes>
  );
}

export default App;