const PricingSuggestion = require('../models/PricingSuggestion');
const ReorderSuggestion = require('../models/ReorderSuggestion');
const Product = require('../models/Product');

class RecommendationService {
  constructor(advisorService) {
    this.advisorService = advisorService;
  }

  async generatePricingRecommendations() {
    try {
      // Get all products
      const products = await Product.find();
      
      // Clear existing suggestions
      await PricingSuggestion.deleteMany({});
      
      // Generate new suggestions for each product
      for (const product of products) {
        const suggestions = await this.advisorService.getPricingSuggestions(product);
        
        // Save each suggestion to database
        for (const suggestion of suggestions) {
          const pricingSuggestion = new PricingSuggestion(suggestion);
          await pricingSuggestion.save();
        }
      }
      
      return { success: true, message: 'Pricing recommendations generated successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async generateReorderRecommendations() {
    try {
      // Get all products with their inventory data
      const products = await Product.find();
      
      // Transform products into inventory format for advisors
      const inventory = products.map(product => ({
        productId: product._id,
        productName: product.name,
        currentStock: product.stock,
        averageMonthlySales: product.averageMonthlySales || 50, // Default value
        salesHistory: product.salesHistory || [],
        supplier: product.supplier
      }));
      
      // Clear existing suggestions
      await ReorderSuggestion.deleteMany({});
      
      // Generate new suggestions
      const suggestions = await this.advisorService.getReorderSuggestions(inventory);
      
      // Save each suggestion to database
      for (const suggestion of suggestions) {
        const reorderSuggestion = new ReorderSuggestion(suggestion);
        await reorderSuggestion.save();
      }
      
      return { success: true, message: 'Reorder recommendations generated successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getAllRecommendations() {
    try {
      const pricingSuggestions = await PricingSuggestion.find().populate('productId');
      const reorderSuggestions = await ReorderSuggestion.find();
      
      return {
        pricing: pricingSuggestions,
        reorder: reorderSuggestions
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = RecommendationService;