const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const User = require('../models/User');
const Product = require('../models/Product');

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
    
    // NOTA: Assumindo que adicionámos 'stripePriceId' ao nosso modelo de Produto
    if (!product.stripePriceId) {
        return res.status(400).json({ msg: 'ID de preço do Stripe não configurado para este produto.' });
    }

    // Obter ou criar o ID de cliente no Stripe
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name });
      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    // Definir os URLs de sucesso e cancelamento
    const successUrl = `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.CLIENT_URL}/product/${productId}`;

    // Criar a sessão de checkout
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
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Passar o ID do nosso utilizador e produto para o webhook
      metadata: {
        userId: userId,
        productId: productId
      }
    });

    // Enviar o URL da sessão de volta para o cliente
    res.json({ url: session.url });

  } catch (err) {
    console.error('Erro ao criar sessão de checkout:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;