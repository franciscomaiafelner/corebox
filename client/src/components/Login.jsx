import { useState } from 'react';
import axios from 'axios'; // Importar o axios

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      // Fazer o pedido POST para a nossa rota de login
      const res = await axios.post('/api/users/login', formData);

      console.log('Token recebido:', res.data.token);

      // Guardar o token no localStorage do browser
      localStorage.setItem('token', res.data.token);

      alert('Login bem-sucedido!');
      // TODO: Redirecionar o utilizador para um painel de controlo (dashboard)

    } catch (err) {
      console.error('Erro de login:', err.response.data);
      alert('Erro: ' + err.response.data.msg);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {/* O resto do JSX continua igual... */}
      <div>
        <input type="email" placeholder="Email" name="email" value={email} onChange={onChange} required />
      </div>
      <div>
        <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required />
      </div>
      <input type="submit" value="Login" />
    </form>
  );
};

export default Login;