const Product = require('../models/Product');
const { generatePricingSuggestion, generateReorderSuggestion } = require('../services/advisorService');
const PricingSuggestion = require('../models/PricingSuggestion');
const ReorderSuggestion = require('../models/ReorderSuggestion');

const categoryAverages = {
  ELECTRONICS: 5,
  APPAREL: 10,
  HOME: 3
};

const queueRecommendations = (product, triggerReason) => {
  setImmediate(async () => {
    try {
      const duplicateFilter = { product: product._id, triggerReason, status: 'PENDING' };
      const [pricingPending, reorderPending] = await Promise.all([
        PricingSuggestion.exists(duplicateFilter),
        ReorderSuggestion.exists(duplicateFilter)
      ]);

      await Promise.all([
        pricingPending ? null : generatePricingSuggestion(product, triggerReason),
        reorderPending ? null : generateReorderSuggestion(product, triggerReason)
      ]);
    } catch (error) {
      console.error(`Recommendation loop failed for ${product.sku}:`, error.message);
    }
  });
};

// Get all products with optional filtering
const getProducts = async (req, res) => {
  try {
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a product
const createProduct = async (req, res) => {
  try {
    const product = new Product({
      sku: req.body.sku,
      name: req.body.name,
      category: req.body.category,
      currentPrice: req.body.currentPrice,
      stockLevel: req.body.stockLevel,
      reorderThreshold: req.body.reorderThreshold,
      demandVelocity: req.body.demandVelocity || 0,
      status: req.body.status || 'ACTIVE'
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update stock level (fires agentic loop if below reorder threshold)
const updateStockLevel = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const previousStockLevel = product.stockLevel;
    product.stockLevel = req.body.stockLevel;
    
    // Update status based on stock level
    if (product.stockLevel === 0) {
      product.status = 'OUT_OF_STOCK';
    } else if (product.status === 'OUT_OF_STOCK' && product.stockLevel > 0) {
      product.status = 'ACTIVE';
    } else if (product.stockLevel < product.reorderThreshold) {
      product.status = 'PRICE_REVIEW_PENDING';
    }
    
    const updatedProduct = await product.save();
    
    // Fire the agentic loop when a stock update leaves inventory below threshold.
    if (previousStockLevel >= product.reorderThreshold &&
        updatedProduct.stockLevel < updatedProduct.reorderThreshold) {
      queueRecommendations(updatedProduct, 'INVENTORY_LOW');
    }
    
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Simulate a sale (decrements stock, bumps demand velocity)
const simulateSale = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Decrement stock
    if (product.stockLevel > 0) {
      product.stockLevel -= 1;
    }
    
    // Increment demand velocity
    product.demandVelocity += 1;
    
    // Update status if now out of stock
    if (product.stockLevel === 0) {
      product.status = 'OUT_OF_STOCK';
    } else if (product.stockLevel < product.reorderThreshold) {
      product.status = 'PRICE_REVIEW_PENDING';
    }
    
    const updatedProduct = await product.save();
    
    const inventoryLow = updatedProduct.stockLevel < updatedProduct.reorderThreshold;
    const demandSpike = updatedProduct.demandVelocity > (categoryAverages[updatedProduct.category] || 5) * 3;
    if (inventoryLow || demandSpike) {
      queueRecommendations(updatedProduct, inventoryLow ? 'INVENTORY_LOW' : 'DEMAND_SPIKE');
    }
    
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Generate on-demand pricing suggestion
const suggestPricing = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const suggestion = await generatePricingSuggestion(product, 'MANUAL');
    res.json(suggestion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate on-demand reorder suggestion
const suggestReorder = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const suggestion = await generateReorderSuggestion(product, 'MANUAL');
    res.json(suggestion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateStockLevel,
  simulateSale,
  suggestPricing,
  suggestReorder
};