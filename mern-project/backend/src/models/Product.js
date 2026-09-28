const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['ELECTRONICS', 'APPAREL', 'HOME']
  },
  currentPrice: {
    type: Number,
    required: true
  },
  stockLevel: {
    type: Number,
    required: true,
    default: 0
  },
  reorderThreshold: {
    type: Number,
    required: true
  },
  demandVelocity: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'PRICE_REVIEW_PENDING', 'OUT_OF_STOCK'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);