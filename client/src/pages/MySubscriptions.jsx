// Ficheiro: client/src/pages/MySubscriptions.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const MySubscriptions = () => {
  const { authState } = useContext(AuthContext);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Apenas executa se o utilizador estiver autenticado
    if (authState.isAuthenticated) {
      const fetchSubscriptions = async () => {
        try {
          // Usamos a nossa instância 'api' que já envia o token
          const res = await api.get('/subscriptions/me');
          setSubscriptions(res.data);
        } catch (err) {
          console.error(err.response?.data?.msg || 'Erro ao buscar subscrições');
          setError(err.response?.data?.msg || 'Não foi possível carregar as suas subscrições.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchSubscriptions();
    } else {
      // Se por algum motivo o utilizador não estiver autenticado, paramos o loading
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]); // A dependência garante que isto corre quando o estado de auth muda

  if (isLoading) {
    return <div>A carregar as suas subscrições...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>As Minhas Subscrições</h1>
        <Link to="/">Voltar ao Marketplace</Link>
      </div>
      <hr />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {subscriptions.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {subscriptions.map(sub => (
            <div key={sub._id} style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
              <img 
                src={sub.product.imageUrl} 
                alt={sub.product.name} 
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', marginRight: '1.5rem' }} 
              />
              <div>
                <h3>{sub.product.name}</h3>
                <p>Estado: <span style={{ fontWeight: 'bold', color: sub.status === 'active' ? 'green' : 'red' }}>{sub.status}</span></p>
                <p>Próximo pagamento: {new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>
                <button disabled>Gerir Subscrição (Brevemente)</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !error && <p>Você ainda não tem nenhuma subscrição ativa. <Link to="/">Explore o nosso marketplace!</Link></p>
      )}
    </div>
  );
};

export default MySubscriptions;