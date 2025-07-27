// src/pages/HomePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const HomePage = () => {
  const { authState, logout } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Bem-vindo ao CoreBox!</h1>
        <div>
          {authState.isAuthenticated ? (
            <>
              <span>Olá, {authState.user.name}!</span>
              
              {/* ADICIONÁMOS O LINK AQUI */}
              <Link to="/my-subscriptions" style={{ marginLeft: '1rem' }}>As Minhas Subscrições</Link>
              
              <button onClick={logout} style={{ marginLeft: '1rem' }}>Logout</button>
            </>
          ) : (
            <div>
              <Link to="/login">Login</Link> | <Link to="/register">Registar</Link>
            </div>
          )}
        </div>
      </div>
      
      <h2>As nossas caixas de subscrição</h2>

      {isLoading ? (
        <p>A carregar produtos...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {products.map(product => (
            // ENVOLVER O DIV COM O LINK
            <Link to={`/product/${product._id}`} key={product._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', textAlign: 'left', height: '100%' }}>
                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                <h3 style={{ marginTop: '1rem' }}>{product.name}</h3>
                <p>{product.description}</p>
                <h4>{product.price.toFixed(2)} € / mês</h4>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;