const express = require('express');
const router = express.Router();
const {
  getPricingSuggestions,
  getReorderSuggestions,
  updatePricingSuggestion,
  updateReorderSuggestion
} = require('../controllers/suggestionController');

// Get all pricing suggestions
router.get('/pricing', getPricingSuggestions);

// Get all reorder suggestions
router.get('/reorder', getReorderSuggestions);

// Accept/reject pricing suggestion
router.patch('/pricing-suggestions/:id', updatePricingSuggestion);

// Accept/reject reorder suggestion
router.patch('/reorder-suggestions/:id', updateReorderSuggestion);

module.exports = router;