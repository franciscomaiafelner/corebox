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

// Init Middleware
// Isto permite-nos receber dados em req.body no formato json
app.use(express.json());


app.get('/', (req, res) => {
  res.send('API do CoreBox está a funcionar!');
});

// Definir e usar as rotas de utilizador
// Tudo o que for para /api/users será tratado no nosso ficheiro de rotas
app.use('/api/users', require('./routes/users'));
// Definir e usar as rotas de autenticação
// Tudo o que for para /api/auth será tratado no nosso ficheiro de rotas
app.use('/api/auth', require('./routes/auth')); 

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});