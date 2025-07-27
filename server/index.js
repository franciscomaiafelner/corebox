const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

app.use('/api/webhooks', require('./routes/webhooks'));

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

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});