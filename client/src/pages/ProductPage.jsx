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
      // Esta parte continua igual...
      const res = await api.post('/payments/create-checkout-session', {
        productId: product._id,
      });
      window.location.href = res.data.url;

    } catch (err) {
      // --- AQUI ESTÁ A ALTERAÇÃO ---

      // 1. Extrair a mensagem específica do erro da API, se existir.
      const errorMessage = err.response?.data?.msg || 'Não foi possível iniciar o processo de pagamento. Tente novamente.';

      // 2. Mostrar a mensagem (específica ou genérica) no alerta.
      console.error('Erro ao redirecionar para o checkout:', err.response?.data || err.message);
      alert(errorMessage);
      
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