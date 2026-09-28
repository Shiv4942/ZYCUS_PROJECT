const axios = require('axios');

class AIAdvisor {
  constructor() {
    this.provider = (process.env.LLM_PROVIDER || 'openai-compatible').toLowerCase();
    this.apiKey = process.env.LLM_API_KEY || '';
    this.model = process.env.LLM_MODEL || 'qwen-cursor';
    const configuredBaseUrl = process.env.LLM_BASE_URL || 'https://litellm-qc.zycus.net/v1/chat/completions';
    this.baseUrl = configuredBaseUrl.endsWith('/chat/completions')
      ? configuredBaseUrl
      : `${configuredBaseUrl.replace(/\/$/, '')}/chat/completions`;
    this.product = process.env.LLM_PRODUCT || 'PC1';
    this.cookie = process.env.LLM_COOKIE || '';
  }

  async callLLM(prompt) {
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      throw new Error('LLM_API_KEY is not configured');
    }

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      product: this.product
    };

    if (this.cookie) headers.Cookie = this.cookie;

    const response = await axios.post(this.baseUrl, {
      model: this.model,
      messages: [
        { role: 'system', content: 'You are a cautious commerce advisor. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    }, { headers, timeout: 20000 });

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('LLM response did not contain message content');
    return content;
  }

  getCategoryAverageVelocity(category) {
    return { ELECTRONICS: 5, APPAREL: 10, HOME: 3 }[category] || 5;
  }

  buildProductContext(product, triggerReason) {
    return `Product: ${product.name} (${product.sku})
Category: ${product.category}
Current price: ${product.currentPrice}
Stock: ${product.stockLevel}
Reorder threshold: ${product.reorderThreshold}
Demand velocity: ${product.demandVelocity} orders in 24h
Category average velocity: ${this.getCategoryAverageVelocity(product.category)}
Trigger: ${triggerReason}`;
  }

  parseJson(response) {
    const cleaned = response.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
  }

  async getPricingSuggestion(product, triggerReason) {
    try {
      const prompt = `Recommend a price action for this product. For INVENTORY_LOW, explain whether protecting remaining stock or clearing inventory is better. For DEMAND_SPIKE, use a modest increase and avoid price gouging.

${this.buildProductContext(product, triggerReason)}

Return exactly this JSON shape:
{"recommendedPrice": number, "changeDirection": "INCREASE"|"DECREASE"|"HOLD", "confidence": number between 0 and 1, "reasoning": "plain English explanation"}`;
      const recommendation = this.parseJson(await this.callLLM(prompt));

      if (!Number.isFinite(recommendation.recommendedPrice) || recommendation.recommendedPrice <= 0) throw new Error('Invalid recommended price');
      if (!['INCREASE', 'DECREASE', 'HOLD'].includes(recommendation.changeDirection)) throw new Error('Invalid change direction');
      if (!Number.isFinite(recommendation.confidence) || recommendation.confidence < 0 || recommendation.confidence > 1) throw new Error('Invalid confidence');

      return {
        currentPrice: product.currentPrice,
        recommendedPrice: Number(Math.min(recommendation.recommendedPrice, product.currentPrice * 3).toFixed(2)),
        changeDirection: recommendation.changeDirection,
        confidence: Number(recommendation.confidence.toFixed(2)),
        reasoning: String(recommendation.reasoning || 'AI recommendation generated from current inventory and demand signals.')
      };
    } catch (error) {
      console.error('AI pricing advisor failed:', error.message);
      return null;
    }
  }

  async getReorderSuggestion(product, triggerReason) {
    try {
      const prompt = `Recommend replenishment for this product. Consider current stock, reorder threshold, demand velocity, a seven-day lead time, and safety stock.

${this.buildProductContext(product, triggerReason)}

Return exactly this JSON shape:
{"recommendedQuantity": positive integer, "suggestedLeadTimeDays": positive integer, "confidence": number between 0 and 1, "reasoning": "plain English explanation"}`;
      const recommendation = this.parseJson(await this.callLLM(prompt));

      if (!Number.isInteger(recommendation.recommendedQuantity) || recommendation.recommendedQuantity <= 0) throw new Error('Invalid recommended quantity');
      if (!Number.isInteger(recommendation.suggestedLeadTimeDays) || recommendation.suggestedLeadTimeDays <= 0) throw new Error('Invalid lead time');
      if (!Number.isFinite(recommendation.confidence) || recommendation.confidence < 0 || recommendation.confidence > 1) throw new Error('Invalid confidence');

      return {
        currentStock: product.stockLevel,
        recommendedQuantity: recommendation.recommendedQuantity,
        suggestedLeadTimeDays: recommendation.suggestedLeadTimeDays,
        confidence: Number(recommendation.confidence.toFixed(2)),
        reasoning: String(recommendation.reasoning || 'AI replenishment recommendation generated from current inventory and demand signals.')
      };
    } catch (error) {
      console.error('AI reorder advisor failed:', error.message);
      return null;
    }
  }
}

module.exports = AIAdvisor;
