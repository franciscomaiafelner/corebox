const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // 1. IMPORTAR O PACOTE

dotenv.config();

const app = express();
const PORT = 5001;

// Ligar à Base de Dados
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Conectado...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

// A SOLUÇÃO ESTÁ AQUI
// Configurar o CORS antes de todas as rotas


app.use('/api/webhooks', require('./routes/webhooks'));

app.use(cors());

// Init Middleware
// Isto permite-nos receber dados em req.body no formato json
app.use(express.json());


app.get('/', (req, res) => {
  res.send('API do CoreBox está a funcionar!');
});

app.use('/api/users', require('./routes/users')); // Rota para utilizadores (registo, etc.)
app.use('/api/auth', require('./routes/auth')); // Rota de autenticação
app.use('/api/products', require('./routes/products')); // Rota para produtos (caixas de subscrição)
app.use('/api/payments', require('./routes/payments')); // Rota para pagamentos (Stripe)
app.use('/api/subscriptions', require('./routes/subscriptions')); // Rota para subscrições (gestão de subscrições do utilizador)

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
