const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// server/models/Product.js
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
  // O NOVO CAMPO
  stripePriceId: {
    type: String,
    required: true
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);