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
import MySubscriptions from './pages/MySubscriptions'; // Importar a página de subscrições

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/dashboard" element={<PrivateRoute role="seller"><Dashboard /></PrivateRoute>} />
      
      {/* 2. ADICIONAR A NOVA ROTA AQUI */}
      <Route 
        path="/my-subscriptions" 
        element={
          <PrivateRoute>
            <MySubscriptions />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

export default App;