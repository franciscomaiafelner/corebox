// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute'; // 1. Importar
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage'; // Importar a nova página
import PaymentSuccess from './pages/PaymentSuccess'; // A linha que falta

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/product/:id" element={<ProductPage />} /> {/* A NOSSA NOVA ROTA */}
      <Route path="/payment-success" element={<PaymentSuccess />} /> {/* A NOSSA NOVA ROTA DE SUCESSO */}
      <Route path="/dashboard" element={<PrivateRoute role="seller"><Dashboard /></PrivateRoute>} />
    </Routes>
  );
}

export default App;