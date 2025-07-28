// Ficheiro: server/routes/subscriptions.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth(middleware)');
const Subscription = require('../models/Subscription');
const User = require('../models/User'); // Precisamos do modelo User
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // E do stripe
const Product = require('../models/Product');

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

// @route   GET api/subscriptions/seller-dashboard
// @desc    Obter todos os dados para o painel do vendedor
// @access  Privado (Vendedor)
router.get('/seller-dashboard', auth, async (req, res) => {
  try {
    // 1. Encontrar o produto do vendedor autenticado
    const product = await Product.findOne({ seller: req.user.id });
    if (!product) {
      return res.status(404).json({ msg: 'Nenhum produto encontrado para este vendedor.' });
    }

    // 2. Encontrar todas as subscrições ativas para este produto
    const subscriptions = await Subscription.find({ product: product._id, status: 'active' })
      .populate('user', 'name email') // Popular com o nome e email do subscritor
      .sort({ createdAt: 'asc' });   // Ordenar por data de criação para o gráfico

    // 3. Calcular as métricas
    const totalSubscribers = subscriptions.length;
    const monthlyRevenue = totalSubscribers * product.price;

    // 4. Preparar os dados para a tabela de subscritores
    const subscribersData = subscriptions.map(sub => ({
      id: sub._id,
      name: sub.user.name,
      email: sub.user.email,
      status: sub.status,
      shippingAddress: `${sub.shippingAddress.street}, ${sub.shippingAddress.street2 || ''} ${sub.shippingAddress.postalCode} ${sub.shippingAddress.city}, ${sub.shippingAddress.country}`
    }));

    // 5. Calcular os dados para o gráfico de evolução de receitas
    const revenueChartData = [];
    let cumulativeRevenue = 0;
    subscriptions.forEach(sub => {
        cumulativeRevenue += product.price;
        revenueChartData.push({
            // Formatar a data para o gráfico (ex: "28/07/2025")
            date: new Date(sub.createdAt).toLocaleDateString('pt-PT'), 
            revenue: cumulativeRevenue
        });
    });

    // 6. Enviar tudo num único objeto
    res.json({
      product,
      metrics: {
        totalSubscribers,
        monthlyRevenue
      },
      subscribers: subscribersData,
      revenueChartData
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;

