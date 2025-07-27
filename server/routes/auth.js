const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth(middleware)'); // O nosso "segurança"
const User = require('../models/User');

// @route   GET api/auth
// @desc    Obter dados do utilizador autenticado
// @access  Privado (requer token)
router.get('/', auth, async (req, res) => {
  try {
    // O middleware 'auth' já validou o token e adicionou o user ao req.
    // Agora podemos usar o req.user.id para encontrar o utilizador na BD.
    const user = await User.findById(req.user.id).select('-password'); // .select('-password') remove a password da resposta
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;