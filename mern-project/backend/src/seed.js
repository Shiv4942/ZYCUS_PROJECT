// Seed script for StockPulse database
// Adds initial products for testing the agentic recommendation loop

const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/stockpulse';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Seed data - adapted from Addendum A
const seedProducts = [
  {
    sku: 'SKU-ELEC-001',
    name: 'Wireless Earbuds Pro',
    category: 'ELECTRONICS',
    currentPrice: 79.99,
    stockLevel: 45,
    reorderThreshold: 20,
    demandVelocity: 3,
    status: 'ACTIVE'
  },
  {
    sku: 'SKU-ELEC-002',
    name: 'USB-C Hub 7-Port',
    category: 'ELECTRONICS',
    currentPrice: 34.99,
    stockLevel: 120,
    reorderThreshold: 30,
    demandVelocity: 1,
    status: 'ACTIVE'
  },
  {
    sku: 'SKU-APP-001',
    name: 'Organic Cotton T-Shirt',
    category: 'APPAREL',
    currentPrice: 24.99,
    stockLevel: 8,
    reorderThreshold: 15,
    demandVelocity: 12,
    status: 'PRICE_REVIEW_PENDING'
  },
  {
    sku: 'SKU-APP-002',
    name: 'Running Shorts — Navy',
    category: 'APPAREL',
    currentPrice: 39.99,
    stockLevel: 55,
    reorderThreshold: 20,
    demandVelocity: 2,
    status: 'ACTIVE'
  },
  {
    sku: 'SKU-HOME-001',
    name: 'Ceramic Pour-Over Set',
    category: 'HOME',
    currentPrice: 49.99,
    stockLevel: 22,
    reorderThreshold: 10,
    demandVelocity: 4,
    status: 'ACTIVE'
  },
  {
    sku: 'SKU-HOME-002',
    name: 'LED Desk Lamp — Dimmable',
    category: 'HOME',
    currentPrice: 59.99,
    stockLevel: 0,
    reorderThreshold: 15,
    demandVelocity: 0,
    status: 'OUT_OF_STOCK'
  },
  {
    sku: 'SKU-ELEC-003',
    name: 'Portable Charger 20K',
    category: 'ELECTRONICS',
    currentPrice: 44.99,
    stockLevel: 18,
    reorderThreshold: 25,
    demandVelocity: 8,
    status: 'ACTIVE'
  },
  {
    sku: 'SKU-APP-003',
    name: 'Hoodie — Heather Grey',
    category: 'APPAREL',
    currentPrice: 54.99,
    stockLevel: 11,
    reorderThreshold: 12,
    demandVelocity: 15,
    status: 'ACTIVE'
  }
];

// Insert seed data
const seedDB = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert seed products
    const products = await Product.insertMany(seedProducts);
    console.log(`Inserted ${products.length} products`);
    
    // Show specific products for demo paths
    const lowStockProduct = products.find(p => p.sku === 'SKU-APP-001');
    const highVelocityProduct = products.find(p => p.sku === 'SKU-APP-003');
    
    console.log('\n--- Demo Paths ---');
    console.log(`Inventory Low Path: ${lowStockProduct.name} (SKU: ${lowStockProduct.sku})`);
    console.log(`  Stock: ${lowStockProduct.stockLevel}, Threshold: ${lowStockProduct.reorderThreshold}`);
    console.log(`  Run: POST /api/products/${lowStockProduct._id}/orders to trigger suggestions`);
    
    console.log(`\nDemand Spike Path: ${highVelocityProduct.name} (SKU: ${highVelocityProduct.sku})`);
    console.log(`  Stock: ${highVelocityProduct.stockLevel}, Threshold: ${highVelocityProduct.reorderThreshold}`);
    console.log(`  Velocity: ${highVelocityProduct.demandVelocity} (category avg for APPAREL is 10)`);
    console.log(`  Run: POST /api/products/${highVelocityProduct._id}/orders multiple times to trigger suggestions`);
    
    console.log('\n--- Available Endpoints ---');
    console.log('GET  /api/products - List all products');
    console.log('GET  /api/products?status=ACTIVE - Filter by status');
    console.log('GET  /api/products?category=APPAREL - Filter by category');
    console.log('POST /api/products/:id/orders - Simulate sale');
    console.log('PATCH /api/products/:id/stock - Update stock level');
    console.log('POST /api/products/:id/suggest-pricing - Get pricing suggestion');
    console.log('POST /api/products/:id/suggest-reorder - Get reorder suggestion');
    console.log('GET  /api/suggestions/pricing - List pricing suggestions');
    console.log('GET  /api/suggestions/reorder - List reorder suggestions');
    console.log('PATCH /api/pricing-suggestions/:id - Accept/reject pricing suggestion');
    console.log('PATCH /api/reorder-suggestions/:id - Accept/reject reorder suggestion');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seed script
seedDB();