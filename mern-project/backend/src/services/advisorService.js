const RuleAdvisor = require('./ruleAdvisor');
const AIAdvisor = require('./aiAdvisor');
const PricingSuggestion = require('../models/PricingSuggestion');
const ReorderSuggestion = require('../models/ReorderSuggestion');

// Factory function to get the active advisor strategy
const getActiveAdvisor = () => {
  const strategy = process.env.ADVISOR_STRATEGY || 'rule';
  
  switch(strategy.toLowerCase()) {
    case 'ai':
      return new AIAdvisor();
    case 'rule':
    default:
      return new RuleAdvisor();
  }
};

// Generate a pricing suggestion using the active advisor strategy
const generatePricingSuggestion = async (product, triggerReason) => {
  try {
    const advisor = getActiveAdvisor();
    const suggestionData = await advisor.getPricingSuggestion(product, triggerReason);
    
    // If advisor fails to generate suggestion, fallback to rule-based
    if (!suggestionData) {
      const fallbackAdvisor = new RuleAdvisor();
      const fallbackSuggestion = await fallbackAdvisor.getPricingSuggestion(product, triggerReason);
      
      if (fallbackSuggestion) {
        fallbackSuggestion.product = product._id;
        fallbackSuggestion.triggerReason = triggerReason;
        return await PricingSuggestion.create(fallbackSuggestion);
      }
      throw new Error('Failed to generate pricing suggestion');
    }
    
    // Validate suggestion data
    if (suggestionData.recommendedPrice <= 0) {
      throw new Error('Invalid recommended price');
    }
    
    // Add product reference and trigger reason
    suggestionData.product = product._id;
    suggestionData.triggerReason = triggerReason;
    
    return await PricingSuggestion.create(suggestionData);
  } catch (error) {
    console.error('Error generating pricing suggestion:', error);
    
    // Fallback to rule-based advisor
    try {
      const fallbackAdvisor = new RuleAdvisor();
      const fallbackSuggestion = await fallbackAdvisor.getPricingSuggestion(product, triggerReason);
      
      if (fallbackSuggestion) {
        fallbackSuggestion.product = product._id;
        fallbackSuggestion.triggerReason = triggerReason;
        return await PricingSuggestion.create(fallbackSuggestion);
      }
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
    }
    
    throw error;
  }
};

// Generate a reorder suggestion using the active advisor strategy
const generateReorderSuggestion = async (product, triggerReason) => {
  try {
    const advisor = getActiveAdvisor();
    const suggestionData = await advisor.getReorderSuggestion(product, triggerReason);
    
    // If advisor fails to generate suggestion, fallback to rule-based
    if (!suggestionData) {
      const fallbackAdvisor = new RuleAdvisor();
      const fallbackSuggestion = await fallbackAdvisor.getReorderSuggestion(product, triggerReason);
      
      if (fallbackSuggestion) {
        fallbackSuggestion.product = product._id;
        fallbackSuggestion.triggerReason = triggerReason;
        return await ReorderSuggestion.create(fallbackSuggestion);
      }
      throw new Error('Failed to generate reorder suggestion');
    }
    
    // Validate suggestion data
    if (suggestionData.recommendedQuantity <= 0) {
      throw new Error('Invalid recommended quantity');
    }
    
    // Add product reference and trigger reason
    suggestionData.product = product._id;
    suggestionData.triggerReason = triggerReason;
    
    return await ReorderSuggestion.create(suggestionData);
  } catch (error) {
    console.error('Error generating reorder suggestion:', error);
    
    // Fallback to rule-based advisor
    try {
      const fallbackAdvisor = new RuleAdvisor();
      const fallbackSuggestion = await fallbackAdvisor.getReorderSuggestion(product, triggerReason);
      
      if (fallbackSuggestion) {
        fallbackSuggestion.product = product._id;
        fallbackSuggestion.triggerReason = triggerReason;
        return await ReorderSuggestion.create(fallbackSuggestion);
      }
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
    }
    
    throw error;
  }
};

module.exports = {
  generatePricingSuggestion,
  generateReorderSuggestion
};