// src/pages/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false); // Estado para feedback ao utilizador

  useEffect(() => {
    const fetchProduct = async () => {
      // A lógica para ir buscar o produto continua igual...
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
  }, [id]);

  // A NOVA FUNÇÃO PARA INICIAR O CHECKOUT
  const handleSubscriptionClick = async () => {
    setIsRedirecting(true);
    try {
      // 1. Pedir ao nosso backend para criar a sessão de checkout
      const res = await api.post('/payments/create-checkout-session', {
        productId: product._id,
      });

      // 2. Redirecionar o utilizador para o URL do Stripe recebido
      window.location.href = res.data.url;

    } catch (err) {
      console.error('Erro ao redirecionar para o checkout:', err);
      alert('Não foi possível iniciar o processo de pagamento. Tente novamente.');
      setIsRedirecting(false);
    }
  };

  if (isLoading) {
    return <p>A carregar produto...</p>;
  }

  if (!product) {
    return <p>Produto não encontrado.</p>;
  }

  return (
    <div>
      <Link to="/">← Voltar ao Marketplace</Link>
      <div style={{ marginTop: '2rem' }}>
        <h1>{product.name}</h1>
        <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '500px', borderRadius: '8px' }} />
        <p>{product.description}</p>
        <h3>Preço: {product.price.toFixed(2)} € / mês</h3>
        <button 
          onClick={handleSubscriptionClick} 
          disabled={isRedirecting}
          style={{ padding: '1em 2em', fontSize: '1.2em', marginTop: '1rem' }}
        >
          {isRedirecting ? 'A redirecionar para o pagamento...' : 'Subscrever Agora'}
        </button>
      </div>
    </div>
  );
};

export default ProductPage;