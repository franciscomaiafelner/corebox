const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Product = require('../models/Product');
const User = require('../models/User');

// @route   GET api/products
// @desc    Obter todos os produtos para o marketplace público
// @access  Público
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   GET api/products/my-box
// @desc    Obter a caixa de subscrição associada ao vendedor autenticado
// @access  Privado
router.get('/my-box', auth, async (req, res) => {
  try {
    const product = await Product.findOne({ seller: req.user.id });
    if (!product) {
      return res.status(404).json({ msg: 'Nenhuma caixa de subscrição encontrada para este vendedor.' });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   GET api/products/:id
// @desc    Obter um único produto pelo seu ID
// @access  Público
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Produto não encontrado' });
    }
    res.status(500).send('Erro no Servidor');
  }
});

// @route   POST api/products
// @desc    Criar um novo produto (caixa de subscrição)
// @access  Privado (Admin)
router.post('/', [auth, admin], async (req, res) => {
  // ... a lógica do POST continua a mesma ...
  const { name, description, price, imageUrl, seller } = req.body;
  try {
    if (!name || !description || !price || !imageUrl || !seller) {
      return res.status(400).json({ msg: 'Por favor, inclua todos os campos.' });
    }
    const sellerExists = await User.findById(seller);
    if (!sellerExists) {
      return res.status(404).json({ msg: 'Vendedor não encontrado.' });
    }
    const newProduct = new Product({ name, description, price, imageUrl, seller });
    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;