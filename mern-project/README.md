# StockPulse - AI Inventory & Dynamic Pricing Engine

StockPulse is an intelligent inventory management and dynamic pricing system built with the MERN stack. It automatically generates pricing and reorder recommendations based on real-time inventory signals and demand velocity, helping merchants make data-driven decisions.

## Features

- **Real-time Inventory Monitoring**: Tracks stock levels and demand velocity
- **AI-Powered Recommendations**: Uses LLMs to generate intelligent pricing and reorder suggestions
- **Rule-Based Fallbacks**: Robust rule engine when AI is unavailable
- **Agentic Recommendation Loop**: Automatically generates suggestions when thresholds are crossed
- **Merchandising Console**: Web UI for reviewing and approving recommendations
- **Strategy Switching**: Toggle between rule-based and AI strategies at runtime

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **AI Integration**: Gemini, Groq, or Ollama LLMs
- **Deployment**: Docker-ready, environment-based configuration

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager
- Git
## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/stockpulse.git
   cd stockpulse
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
## Demo Paths

### Inventory Low Path
1. The "Organic Cotton T-Shirt" (SKU-APP-001) starts with stock level 8 and reorder threshold 15
2. POST a simulated sale to reduce stock further:
   ```bash
   curl -X POST http://localhost:5000/api/products/[PRODUCT_ID]/orders
   ```
3. Check the merchandising console for automatically generated pricing and reorder suggestions

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products?status=ACTIVE` - Filter by status
- `GET /api/products?category=APPAREL` - Filter by category
- `POST /api/products/:id/orders` - Simulate sale
- `PATCH /api/products/:id/stock` - Update stock level
- `POST /api/products/:id/suggest-pricing` - Get pricing suggestion
- `POST /api/products/:id/suggest-reorder` - Get reorder suggestion
## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│   Frontend      │    │    Backend       │    │    Database        │
│   (React)       │◄──►│   (Node/Express) │◄──►│   (MongoDB)        │
└─────────────────┘    └──────────────────┘    └────────────────────┘
                              │
                     ┌────────▼────────┐
                     │  LLM Services   │
                     │ (Gemini/Groq/Ollama)│
                     └─────────────────┘
```

### Key Components
## Development

### Folder Structure

```
stockpulse/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
### Testing

Run backend tests:
```bash
cd backend
npm test
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Deployment

### Using Docker

Build and run with Docker Compose:
```bash
docker-compose up --build
```

### Manual Deployment

1. Set up MongoDB instance
2. Configure environment variables
3. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```
4. Deploy backend:
   ```bash
   cd backend
   npm start
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to Gemini, Groq, and Ollama for providing LLM APIs
- Inspired by modern retail challenges in inventory and pricing management
│   └── package.json
├── ADR.md
└── README.md
```

1. **Product Model**: Core entity representing inventory items
2. **Suggestion Models**: PricingSuggestion and ReorderSuggestion for recommended actions
3. **Advisor Services**: Rule-based and AI-powered recommendation engines
4. **Controllers**: Handle HTTP requests and coordinate business logic
5. **Event System**: Asynchronous processing of inventory signals
6. **Frontend**: Merchandising console for reviewing and approving suggestions

### Suggestions
- `GET /api/suggestions/pricing` - List pricing suggestions
- `GET /api/suggestions/reorder` - List reorder suggestions
- `PATCH /api/pricing-suggestions/:id` - Accept/reject pricing suggestion
- `PATCH /api/reorder-suggestions/:id` - Accept/reject reorder suggestion
### Demand Spike Path
1. The "Hoodie — Heather Grey" (SKU-APP-003) has high demand velocity (15 vs category average of 10)
2. POST multiple simulated sales to trigger the demand spike detection:
   ```bash
   curl -X POST http://localhost:5000/api/products/[PRODUCT_ID]/orders
   ```
3. Check the merchandising console for spike-triggered suggestions
# Server Configuration
PORT=5000
MONGO_URI=mongodb://localhost:27017/stockpulse

# LLM Configuration (choose one provider)
LLM_PROVIDER=gemini   # or 'groq' or 'ollama'
LLM_API_KEY=your_api_key_here
LLM_MODEL=gemini-1.5-flash
LLM_BASE_URL=https://generativelanguage.googleapis.com

# Advisor Strategy
ADVISOR_STRATEGY=rule   # or 'ai' to use LLMs
```

### MongoDB Setup

Ensure MongoDB is running locally or update `MONGO_URI` to point to your database instance.

## Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Seed the database** (optional but recommended):
   ```bash
   npm run seed
   ```

3. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```

4. Open your browser to `http://localhost:5173` to access the merchandising console.
## Project Structure

```
stockpulse-mern/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Product.js
│   │   │   ├── PricingSuggestion.js
│   │   │   └── ReorderSuggestion.js
│   │   ├── routes/
│   │   │   ├── productRoutes.js
│   │   │   └── suggestionRoutes.js
│   │   ├── controllers/
│   │   │   ├── productController.js
│   │   │   └── suggestionController.js
│   │   ├── services/
│   │   │   ├── advisorService.js
│   │   │   ├── ruleAdvisor.js
│   │   │   ├── aiAdvisor.js
│   │   │   └── recommendationService.js
│   │   └── server.js
│   ├── .env
│   ├── package.json
│   └── src/seed.js
└── frontend/
## Key Features Implemented

### 1. Domain Model & API
- **Product** entity with SKU, name, category, current price, stock level, reorder threshold, demand velocity, and lifecycle status
- **PricingSuggestion** with recommended price, change direction, confidence, reasoning, and trigger context
- **ReorderSuggestion** with recommended quantity, lead time, confidence, reasoning, and trigger context
- Complete RESTful API supporting all required operations

### 2. Pluggable Commerce Engine
- Strategy interface for pricing and reorder recommendations
- Rule-based strategy implementation with deterministic business rules
- AI-powered strategy leveraging LLMs for intelligent recommendations
- Runtime strategy switching via environment variables without code changes

### 3. AI Commerce Advisor
- Integration with multiple LLM providers (Gemini, Groq, Ollama)
- Context-aware prompting distinguishing inventory-low vs demand-spike scenarios
- Response validation ensuring price/reorder bounds are sensible
- Graceful fallback to rule-based strategies when LLMs fail

## API Endpoints

### Product Management
- `GET /api/products` - List all products (with optional status/category filtering)
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product
- `PATCH /api/products/:id/stock` - Update stock level (automatically triggers suggestions if below reorder threshold)
- `POST /api/products/:id/orders` - Simulate a sale (decrements stock, bumps demand velocity; may trigger suggestions)

### On-Demand Suggestions
- `POST /api/products/:id/suggest-pricing` - Generate pricing suggestion on demand
- `POST /api/products/:id/suggest-reorder` - Generate reorder suggestion on demand

### Suggestion Management
- `GET /api/suggestions/pricing` - Get all pricing suggestions
- `GET /api/suggestions/reorder` - Get all reorder suggestions
- `PATCH /api/pricing-suggestions/:id` - Accept/reject pricing suggestion (accept updates Product.currentPrice)
## Getting Started

### Prerequisites
1. **Node.js** (v14 or higher) - https://nodejs.org/
2. **MongoDB** (local installation or MongoDB Atlas) - https://www.mongodb.com/
3. **Git** - https://git-scm.com/

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/stockpulse
   LLM_PROVIDER=gemini  # or 'groq' or 'ollama'
## Demo Paths

### Inventory Low Path
1. Start with the "Organic Cotton T-Shirt" (SKU-APP-001) which has:
   - Stock level: 8
   - Reorder threshold: 15
2. POST to `/api/products/{id}/orders` to reduce stock further
3. When stock drops below threshold, both pricing and reorder suggestions appear in the console
4. View and accept/reject suggestions in the merchandising console

## Architecture Decisions

### Commerce Logic Placement
Business logic resides in service layers (`advisorService.js`, `ruleAdvisor.js`, `aiAdvisor.js`) separate from controllers, enabling:
- Strategy pattern implementation
- Easy switching between rule-based and AI approaches
- Centralized validation and error handling

### Unified vs Split AI Calls
Single AI calls return both pricing and reorder recommendations because:
- More cost-effective than separate calls
- Better contextual consistency
- Reduced latency for merchandisers
- Fallback mechanism works identically for both outputs

### Runtime Strategy Switching
Strategy selection uses environment variables with factory pattern to:
- Enable switching without restarting the application
- Support seamless A/B testing of strategies
- Allow operations team control without developer involvement
## Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/stockpulse |
| LLM_PROVIDER | LLM provider | gemini |
| LLM_API_KEY | API key for LLM provider | none |
| LLM_MODEL | Model identifier | gemini-1.5-flash |
| LLM_BASE_URL | Provider endpoint | https://generativelanguage.googleapis.com |
| ADVISOR_STRATEGY | Active strategy | rule |

## Windows Users - Execution Policy Note

If you encounter issues running npm commands due to script execution policy:

1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Type `Y` to confirm

After setup, you can restore the original policy with:
`Set-ExecutionPolicy Restricted -Scope CurrentUser`

## Contributing

This project was developed as part of the Zycus hackathon challenge. Contributions to enhance the system are welcome through pull requests.

## License

This project is licensed under the MIT License.

### LLM Failure Handling
Multiple layers of protection ensure system reliability:
- Input validation before LLM calls
- Timeout handling
- JSON response parsing with fallback
- Automatic switch to rule-based when LLM unavailable

### Agentic Loop Decoupling
Event-driven architecture using Express middleware features:
- Separation of concern between API requests and background tasks
- Immediate response to clients
- Prevention of duplicate processing
- Clean error propagation
### Demand Spike Path
1. Start with the "Hoodie — Heather Grey" (SKU-APP-003) which has:
   - Stock level: 11
   - Demand velocity: 15 (category average for APPAREL is 10)
2. POST multiple times to `/api/products/{id}/orders` to increase velocity
3. When velocity exceeds 3× category average, both pricing and reorder suggestions appear
4. View and manage suggestions in the merchandising console
   LLM_API_KEY=your_api_key_here  # Required only for AI strategy
   LLM_MODEL=gemini-1.5-flash
   LLM_BASE_URL=https://generativelanguage.googleapis.com
   ADVISOR_STRATEGY=rule  # or 'ai' to enable LLM features
   ```

4. Run the database seed script to populate with sample products:
   ```bash
   node src/seed.js
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown in the terminal (typically http://localhost:5173)
- `PATCH /api/reorder-suggestions/:id` - Accept/reject reorder suggestion (accept updates stock level)
### 4. Agentic Recommendation Loop
- Event-driven triggers when inventory crosses thresholds or demand velocity spikes
- Asynchronous processing keeping HTTP responses fast
- Idempotency protection preventing duplicate suggestions
- Automatic generation of both pricing and reorder suggestions per trigger

### 5. Merchandising Console
- Dashboard showing products needing review with status filtering
- Visualization of pending suggestions with AI reasoning
- Accept/reject controls for pricing and reorder recommendations
- Trigger badges distinguishing INVENTORY_LOW vs DEMAND_SPIKE events
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```