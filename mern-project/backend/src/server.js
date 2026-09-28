const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import routes
const productRoutes = require('./routes/productRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.get('/', (req, res) => {
  res.send('Procurement Advisor API is running...');
});

app.use('/api/products', productRoutes);
app.use('/api/suggestions', suggestionRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/procurementadvisor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});