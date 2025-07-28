const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'incomplete', 'past_due'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  shippingAddress: {
    street: { type: String },
    street2: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);