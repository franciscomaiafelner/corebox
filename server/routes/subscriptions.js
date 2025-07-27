// Ficheiro: server/routes/subscriptions.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth(middleware)');
const Subscription = require('../models/Subscription');
const User = require('../models/User'); // Precisamos do modelo User
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // E do stripe

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

// @route   POST api/subscriptions/manage
// @desc    Criar uma sessão do Stripe Customer Portal
// @access  Privado
router.post('/manage', auth, async (req, res) => {
  try {
    // 1. Encontrar o utilizador na nossa BD para obter o seu ID de cliente no Stripe
    const user = await User.findById(req.user.id);
    if (!user.stripeCustomerId) {
      return res.status(400).json({ msg: 'Utilizador não encontrado no Stripe.' });
    }

    // 2. Criar a sessão do Portal do Cliente
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/my-subscriptions`, // Para onde o user volta
    });

    // 3. Enviar o URL da sessão de volta para o frontend
    res.json({ url: portalSession.url });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});


module.exports = router;
