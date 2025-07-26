// src/pages/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const [box, setBox] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyBox = async () => {
      try {
        // Usamos a nossa instância 'api' que já envia o token
        const res = await api.get('/products/my-box');
        setBox(res.data);
      } catch (err) {
        // O erro 404 (não encontrou caixa) também cai aqui
        console.error(err.response.data.msg);
        setError(err.response.data.msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyBox();
  }, []); // O array vazio garante que isto corre só uma vez

  if (isLoading) {
    return <div>A carregar painel...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>O Meu Painel de Vendedor</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <hr />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {box ? (
        <div>
          <h2>{box.name}</h2>
          <img src={box.imageUrl} alt={box.name} style={{ maxWidth: '300px', borderRadius: '8px' }} />
          <p>{box.description}</p>
          <h3>Preço: {box.price.toFixed(2)} €</h3>
        </div>
      ) : (
        !error && <p>Parece que ainda não tem uma caixa de subscrição associada.</p>
      )}
    </div>
  );
};

export default Dashboard;