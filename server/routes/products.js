const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Product = require('../models/Product');
const User = require('../models/User'); // Precisamos para validar o vendedor

// @route   POST api/products
// @desc    Criar um novo produto (caixa de subscrição)
// @access  Privado (Admin)
router.post('/', [auth, admin], async (req, res) => {
  // O [auth, admin] garante que só um admin autenticado chega aqui.
  
  const { name, description, price, imageUrl, seller } = req.body;

  try {
    // Validação simples para garantir que os campos existem
    if (!name || !description || !price || !imageUrl || !seller) {
      return res.status(400).json({ msg: 'Por favor, inclua todos os campos.' });
    }

    // Verificar se o ID do vendedor fornecido corresponde a um utilizador real
    const sellerExists = await User.findById(seller);
    if (!sellerExists) {
      return res.status(404).json({ msg: 'Vendedor não encontrado.' });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      imageUrl,
      seller // O ID do utilizador vendedor
    });

    const product = await newProduct.save();
    res.status(201).json(product);

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
    // Usamos o ID do utilizador que vem do token (via middleware 'auth')
    // para encontrar o produto onde ele é o vendedor.
    // Usamos findOne porque sabemos que ele só pode ter uma caixa.
    const product = await Product.findOne({ seller: req.user.id });

    // Se não encontrarmos nenhum produto, não é um erro.
    // Significa apenas que este utilizador não tem uma caixa associada.
    if (!product) {
      return res.status(404).json({ msg: 'Nenhuma caixa de subscrição encontrada para este vendedor.' });
    }

    // Se encontrarmos o produto, devolvemo-lo.
    res.json(product);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;