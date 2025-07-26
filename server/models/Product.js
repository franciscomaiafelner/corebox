const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  // A LIGAÇÃO CRÍTICA:
  // Cada produto pertence a um utilizador (o vendedor).
  seller: {
    type: Schema.Types.ObjectId, // Armazena o ID de um utilizador
    ref: 'User' // A referência diz ao Mongoose para procurar na coleção 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);