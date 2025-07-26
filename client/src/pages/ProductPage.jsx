// src/pages/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const ProductPage = () => {
  const { id } = useParams(); // Lê o parâmetro :id do URL
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]); // O efeito corre sempre que o ID no URL muda

  if (isLoading) {
    return <p>A carregar produto...</p>;
  }

  if (!product) {
    return <p>Produto não encontrado.</p>;
  }

  return (
    <div>
      <Link to="/">← Voltar ao Marketplace</Link>
      <h1 style={{ marginTop: '2rem' }}>{product.name}</h1>
      <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '500px', borderRadius: '8px' }} />
      <p>{product.description}</p>
      <h3>Preço: {product.price.toFixed(2)} € / mês</h3>
      <button style={{ padding: '1em 2em', fontSize: '1.2em', marginTop: '1rem' }}>
        Subscrever Agora
      </button>
    </div>
  );
};

export default ProductPage;