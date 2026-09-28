const PricingSuggestion = require('../models/PricingSuggestion');
const ReorderSuggestion = require('../models/ReorderSuggestion');
const Product = require('../models/Product');

// Get all pricing suggestions
const getPricingSuggestions = async (req, res) => {
  try {
    const suggestions = await PricingSuggestion.find().populate('product');
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all reorder suggestions
const getReorderSuggestions = async (req, res) => {
  try {
    const suggestions = await ReorderSuggestion.find().populate('product');
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Accept/reject pricing suggestion
const updatePricingSuggestion = async (req, res) => {
  try {
    const suggestion = await PricingSuggestion.findById(req.params.id).populate('product');
    if (!suggestion) {
      return res.status(404).json({ message: 'Pricing suggestion not found' });
    }

    // Update status
    suggestion.status = req.body.status; // ACCEPTED or REJECTED
    
    const updatedSuggestion = await suggestion.save();
    
    // If accepted, update product price
    if (req.body.status === 'ACCEPTED') {
      const product = suggestion.product;
      product.currentPrice = suggestion.recommendedPrice;
      
      // If this was triggered by inventory low or demand spike, 
      // update product status to ACTIVE
      if (suggestion.triggerReason === 'INVENTORY_LOW' || 
          suggestion.triggerReason === 'DEMAND_SPIKE') {
        product.status = 'ACTIVE';
      }
      
      await product.save();
    }
    
    res.json(updatedSuggestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Accept/reject reorder suggestion
const updateReorderSuggestion = async (req, res) => {
  try {
    const suggestion = await ReorderSuggestion.findById(req.params.id).populate('product');
    if (!suggestion) {
      return res.status(404).json({ message: 'Reorder suggestion not found' });
    }

    // Update status
    suggestion.status = req.body.status; // ACCEPTED or REJECTED
    
    const updatedSuggestion = await suggestion.save();
    
    // If accepted, update product stock (simulated inbound shipment)
    if (req.body.status === 'ACCEPTED') {
      const product = suggestion.product;
      product.stockLevel += suggestion.recommendedQuantity;
      
      // If product was out of stock and now has stock, update status
      if (product.status === 'OUT_OF_STOCK' && product.stockLevel > 0) {
        product.status = 'ACTIVE';
      }
      
      await product.save();
    }
    
    res.json(updatedSuggestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getPricingSuggestions,
  getReorderSuggestions,
  updatePricingSuggestion,
  updateReorderSuggestion
};