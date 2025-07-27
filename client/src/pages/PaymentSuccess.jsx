import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h1>Pagamento Concluído com Sucesso!</h1>
      <p>A sua subscrição está agora ativa.</p>
      {/* AQUI ESTÁ A ALTERAÇÃO */}
      <Link to="/my-subscriptions">Ver as minhas Subscrições</Link> 
      <br/>
      <Link to="/">Voltar ao Marketplace</Link>
    </div>
  );
};

export default PaymentSuccess;