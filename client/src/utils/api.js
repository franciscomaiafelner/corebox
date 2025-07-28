import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Interceptor: corre antes de cada pedido ser enviado
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    // Se houver token, adiciona-o ao cabeçalho 'x-auth-token'
    config.headers['x-auth-token'] = token;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;