import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login, authState } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  // A função de submissão agora é muito simples: ela só "dispara" o login.
  const onSubmit = async e => {
    e.preventDefault();
    await login(email, password);
  };

  // Este useEffect agora trata de TODA a lógica de redirecionamento.
  useEffect(() => {
    console.log('useEffect em Login.jsx disparado com o estado:', authState);
    // Só fazemos alguma coisa se o estado de autenticação estiver finalizado (não a carregar)
    // E se o utilizador estiver de facto autenticado.
    if (!authState.isLoading && authState.isAuthenticated) {
      if (authState.user.role === 'seller') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [authState, navigate]); // A dependência no objeto authState garante que isto corre sempre que ele muda.

  return (
    <form onSubmit={onSubmit}>
      <div><input type="email" placeholder="Email" name="email" value={email} onChange={onChange} required /></div>
      <div><input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required /></div>
      <input type="submit" value="Login" />
    </form>
  );
};

export default Login;