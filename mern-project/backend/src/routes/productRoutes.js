const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateStockLevel,
  simulateSale,
  suggestPricing,
  suggestReorder
} = require('../controllers/productController');

// Get all products with optional filtering
router.get('/', getProducts);

// Get a single product
router.get('/:id', getProductById);

// Create a product
router.post('/', createProduct);

// Update stock level (fires agentic loop if below reorder threshold)
router.patch('/:id/stock', updateStockLevel);

// Simulate a sale (decrements stock, bumps demand velocity)
router.post('/:id/orders', simulateSale);

// Generate on-demand pricing suggestion
router.post('/:id/suggest-pricing', suggestPricing);

// Generate on-demand reorder suggestion
router.post('/:id/suggest-reorder', suggestReorder);

module.exports = router;