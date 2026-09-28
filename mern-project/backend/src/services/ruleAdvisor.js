class RuleAdvisor {
  async getPricingSuggestion(product, triggerReason) {
    try {
      // Rule-based pricing strategy
      let recommendedPrice = product.currentPrice;
      let changeDirection = 'HOLD';
      let reasoning = '';
      let confidence = 0.8;
      
      // Determine recommendation based on trigger reason and product state
      if (triggerReason === 'INVENTORY_LOW') {
        // If stock is low, recommend price increase to protect inventory
        recommendedPrice = product.currentPrice * 1.10; // 10% increase
        changeDirection = 'INCREASE';
        reasoning = 'Low inventory detected. Increasing price to protect remaining stock and maximize revenue per unit.';
        confidence = 0.9;
      } else if (triggerReason === 'DEMAND_SPIKE') {
        // If demand velocity is high, recommend modest price increase
        recommendedPrice = product.currentPrice * 1.05; // 5% increase
        changeDirection = 'INCREASE';
        reasoning = 'High demand velocity detected. Modest price increase to capitalize on increased interest.';
        confidence = 0.85;
      } else if (triggerReason === 'MANUAL') {
        // For manual requests, apply general rules
        if (product.stockLevel < product.reorderThreshold) {
          recommendedPrice = product.currentPrice * 1.10; // 10% increase
          changeDirection = 'INCREASE';
          reasoning = 'Manual review: Stock below reorder threshold. Increasing price to protect inventory.';
          confidence = 0.9;
        } else if (product.demandVelocity > this.getCategoryAverageVelocity(product.category) * 2) {
          recommendedPrice = product.currentPrice * 1.05; // 5% increase
          changeDirection = 'INCREASE';
          reasoning = 'Manual review: High demand velocity. Modest price increase to capitalize on demand.';
          confidence = 0.85;
        } else {
          reasoning = 'Manual review: No significant factors detected. Maintaining current price.';
        }
      } else {
        // Default rules
        if (product.stockLevel < product.reorderThreshold) {
          recommendedPrice = product.currentPrice * 1.10; // 10% increase
          changeDirection = 'INCREASE';
          reasoning = 'Stock below reorder threshold. Increasing price to protect inventory.';
          confidence = 0.9;
        } else if (product.demandVelocity > this.getCategoryAverageVelocity(product.category) * 2) {
          recommendedPrice = product.currentPrice * 1.05; // 5% increase
          changeDirection = 'INCREASE';
          reasoning = 'High demand velocity detected. Modest price increase to capitalize on demand.';
          confidence = 0.85;
        } else {
          reasoning = 'No significant factors detected. Maintaining current price.';
        }
      }
      
      return {
        currentPrice: product.currentPrice,
        recommendedPrice: parseFloat(recommendedPrice.toFixed(2)),
        changeDirection,
        confidence,
        reasoning
      };
    } catch (error) {
      console.error('Error in rule-based pricing advisor:', error);
      return null;
    }
  }

  async getReorderSuggestion(product, triggerReason) {
    try {
      // Rule-based reorder strategy
      let recommendedQuantity = 0;
      let reasoning = '';
      let confidence = 0.8;
      
      // Basic formula: recommend quantity = (reorder threshold × 3) − current stock
      recommendedQuantity = Math.max(1, (product.reorderThreshold * 3) - product.stockLevel);
      
      if (triggerReason === 'INVENTORY_LOW' || product.stockLevel < product.reorderThreshold) {
        reasoning = 'Stock level below reorder threshold. Recommending replenishment to maintain adequate inventory.';
        confidence = 0.9;
      } else if (triggerReason === 'DEMAND_SPIKE' || product.demandVelocity > this.getCategoryAverageVelocity(product.category) * 3) {
        // For demand spikes, recommend more to account for continued high demand
        recommendedQuantity = Math.max(recommendedQuantity, product.reorderThreshold * 4);
        reasoning = 'High demand velocity detected. Recommending larger replenishment to meet continued demand.';
        confidence = 0.85;
      } else if (triggerReason === 'MANUAL') {
        reasoning = 'Manual reorder request. Applying standard replenishment formula.';
      } else {
        reasoning = 'Standard replenishment calculation based on reorder threshold.';
      }
      
      return {
        currentStock: product.stockLevel,
        recommendedQuantity: Math.round(recommendedQuantity),
        suggestedLeadTimeDays: 7, // Standard lead time assumption
        confidence,
        reasoning
      };
    } catch (error) {
      console.error('Error in rule-based reorder advisor:', error);
      return null;
    }
  }

  // Helper method to get category average velocity
  getCategoryAverageVelocity(category) {
    // In a real implementation, this would come from historical data
    const averages = {
      'ELECTRONICS': 5,
      'APPAREL': 10,
      'HOME': 3
    };
    return averages[category] || 5;
  }
}

module.exports = RuleAdvisor;