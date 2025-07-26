import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => { // 1. Aceitar a prop 'role'
  const { authState } = useContext(AuthContext);
  const { isAuthenticated, isLoading, user } = authState;

  if (isLoading) {
    return <div>A carregar...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 2. NOVA VERIFICAÇÃO: Verificar se o cargo do utilizador é o permitido para a rota
  if (role && user.role !== role) {
    // O utilizador está autenticado, mas não tem permissão para aceder a esta página.
    // Poderíamos redirecioná-lo para uma página "Não Autorizado" (403), mas por agora,
    // vamos simplesmente enviá-lo para uma rota segura (que ainda vamos criar, ex: '/').
    // Por enquanto, vamos mostrar uma mensagem simples.
    return <h1>Acesso Negado: Você não tem permissão para ver esta página.</h1>;
  }

  // Se passou em todas as verificações, mostra a página.
  return children;
};

export default PrivateRoute;