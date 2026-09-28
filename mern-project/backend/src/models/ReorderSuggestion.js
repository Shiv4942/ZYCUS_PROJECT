const mongoose = require('mongoose');

const reorderSuggestionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  recommendedQuantity: {
    type: Number,
    required: true
  },
  suggestedLeadTimeDays: {
    type: Number,
    required: true
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

module.exports = mongoose.model('ReorderSuggestion', reorderSuggestionSchema);