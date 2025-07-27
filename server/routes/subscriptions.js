// Ficheiro: server/routes/subscriptions.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth(middleware)'); // Middleware de autenticação
const Subscription = require('../models/Subscription');

// @route   GET api/subscriptions/me
// @desc    Obter todas as subscrições do utilizador autenticado
// @access  Privado
router.get('/me', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id })
      .populate('product', ['name', 'imageUrl']) // <- A magia do populate
      .sort({ createdAt: -1 }); // Ordena pelas mais recentes

    if (!subscriptions) {
      return res.status(404).json({ msg: 'Nenhuma subscrição encontrada.' });
    }

    res.json(subscriptions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;