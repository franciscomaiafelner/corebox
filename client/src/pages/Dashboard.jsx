// src/pages/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Usamos a nossa nova rota que devolve TUDO
        const res = await api.get('/subscriptions/seller-dashboard');
        setDashboardData(res.data);
      } catch (err) {
        console.error(err.response?.data?.msg || 'Erro ao carregar os dados do painel');
        setError(err.response?.data?.msg || 'Não foi possível carregar os dados.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div>A carregar o teu painel...</div>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }
  
  if (!dashboardData) {
      return <p>Ainda não tens dados para mostrar.</p>
  }

  const { product, metrics, subscribers, revenueChartData } = dashboardData;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Painel do Vendedor</h1>
        <button onClick={logout}>Logout</button>
      </div>

      {/* Secção do Produto */}
      <section style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2>A Tua Caixa: {product.name}</h2>
        <p>{product.description}</p>
        <p><strong>Preço:</strong> {product.price.toFixed(2)} € / mês</p>
      </section>

      {/* Secção de Métricas */}
      <section style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', flex: 1 }}>
          <h3>Subscritores Ativos</h3>
          <p style={{ fontSize: '2.5rem', margin: 0 }}>{metrics.totalSubscribers}</p>
        </div>
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', flex: 1 }}>
          <h3>Receita Mensal Estimada</h3>
          <p style={{ fontSize: '2.5rem', margin: 0 }}>{metrics.monthlyRevenue.toFixed(2)} €</p>
        </div>
      </section>

      {/* Secção do Gráfico */}
      <section style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3>Evolução da Receita Cumulativa</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} name="Receita (€)" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Secção da Tabela de Subscritores */}
      <section>
        <h3>Os Teus Subscritores</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Morada de Envio</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map(sub => (
              <tr key={sub.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{sub.name}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{sub.email}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{sub.shippingAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashboard;