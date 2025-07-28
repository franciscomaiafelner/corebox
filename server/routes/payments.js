// Ficheiro: server/routes/payments.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth(middleware)');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const User = require('../models/User');
const Product = require('../models/Product');
const Subscription = require('../models/Subscription'); // 1. IMPORTAR O MODELO

// @route   POST api/payments/create-checkout-session
// @desc    Criar uma nova sessão de checkout no Stripe
// @access  Privado
router.post('/create-checkout-session', auth, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ msg: 'Produto não encontrado.' });
    }
    
    if (!product.stripePriceId) {
        return res.status(400).json({ msg: 'ID de preço do Stripe não configurado para este produto.' });
    }

    // 2. ADICIONAR A NOVA LÓGICA DE VERIFICAÇÃO AQUI
    const existingSubscription = await Subscription.findOne({
      user: userId,
      product: productId,
      status: 'active' // Apenas nos importamos com as que estão ativas
    });

    if (existingSubscription) {
      return res.status(400).json({ msg: 'Você já tem uma subscrição ativa para este produto.' });
    }
    // FIM DA NOVA LÓGICA

    // Obter ou criar o ID de cliente no Stripe (o resto do código continua igual)
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name });
      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    const successUrl = `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.CLIENT_URL}/product/${productId}`;

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      shipping_address_collection: {
        allowed_countries: ['PT'],
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        productId: productId
      }
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error('Erro ao criar sessão de checkout:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;