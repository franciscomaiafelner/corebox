import { useState } from 'react';
import api from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const { name, email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  // A função de submissão agora é assíncrona
  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      // Criar o pedido POST para a nossa API
      // Graças ao proxy, podemos usar um URL relativo
      const res = await api.post('/users/register', formData);
      
      console.log('Resposta do servidor:', res.data); // Ex: { msg: 'Utilizador registado com sucesso' }
      alert('Registo bem-sucedido!');

    } catch (err) {
      // Se a API retornar um erro (ex: utilizador já existe)
      console.error('Erro do servidor:', err.response.data);
      alert('Erro no registo: ' + err.response.data.msg);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {/* O resto do JSX continua igual... */}
      <div>
        <input type="text" placeholder="Nome" name="name" value={name} onChange={onChange} required />
      </div>
      <div>
        <input type="email" placeholder="Email" name="email" value={email} onChange={onChange} required />
      </div>
      <div>
        <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} minLength="6" required />
      </div>
      <input type="submit" value="Registar" />
    </form>
  );
};

export default Register;