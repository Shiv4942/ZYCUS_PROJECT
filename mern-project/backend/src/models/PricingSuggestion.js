const mongoose = require('mongoose');

const pricingSuggestionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  recommendedPrice: {
    type: Number,
    required: true
  },
  changeDirection: {
    type: String,
    required: true,
    enum: ['INCREASE', 'DECREASE', 'HOLD']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  reasoning: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  triggerReason: {
    type: String,
    required: true,
    enum: ['INITIAL', 'INVENTORY_LOW', 'DEMAND_SPIKE', 'MANUAL']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PricingSuggestion', pricingSuggestionSchema);