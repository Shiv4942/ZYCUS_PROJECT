# Architecture Decision Records (ADR)

## 1. Where does commerce logic live?

### Context
We needed to determine where to place the commerce logic for pricing and reorder recommendations. The options were:
1. In the controller layer mixed with HTTP handling
2. In the domain model with the Product entity
3. In dedicated service layers separate from controllers and models

### Options
- Keep logic in controllers for simplicity
- Embed logic in Product model for encapsulation
- Extract to dedicated advisor services for separation of concerns

### Decision
We chose to implement dedicated advisor services (`advisorService.js`, `ruleAdvisor.js`, `aiAdvisor.js`) separate from controllers and models.

### Tradeoffs
**Pros:**
- Clean separation of concerns between HTTP handling and business logic
- Enables strategy pattern implementation for easy switching between rule-based and AI approaches
- Centralized validation and error handling
- Easier to test and maintain

**Cons:**
- Additional layer of abstraction
- Slightly more complex initial setup
- Requires careful coordination between layers

## 2. Unified AI call vs separate pricing/reorder calls?

### Context
When integrating with LLMs, we had to decide whether to make a single call that returns both pricing and reorder recommendations, or separate calls for each.

### Options
- Single unified call returning both recommendations
- Separate calls for pricing and reorder recommendations

### Decision
We chose separate calls for pricing and reorder recommendations.

### Tradeoffs
**Pros:**
- Better error handling with independent fallback mechanisms
- Clearer context for each merchandising decision
- Independent processing and failure isolation
- More precise prompting for specific scenarios

**Cons:**
- Potentially higher latency due to multiple LLM calls
- Slightly higher cost in terms of token usage
- More complex orchestration of multiple calls

## 3. How does runtime strategy switching work?

### Context
We needed to implement a system that allows switching between rule-based and AI-powered advisors without restarting the application or modifying code.

### Options
- Hardcoded strategy selection at compile time
- Environment variable configuration with factory pattern
- Database-driven configuration
- API endpoint for runtime switching

### Decision
We implemented strategy selection using environment variables with a factory pattern in `advisorService.js`.

### Tradeoffs
**Pros:**
- Enables switching without restarting the application
- Supports seamless A/B testing of strategies
- Allows operations team control without developer involvement
- Simple implementation with minimal overhead
- Configuration persists across application restarts

**Cons:**
- Requires application restart to pick up environment variable changes
- Less flexible than database-driven or API-driven approaches
- Only allows one active strategy at a time

## 4. LLM failure handling

### Context
We needed a robust approach to handle failures from the LLM service, including timeouts, invalid responses, and connectivity issues, especially in the async agentic loop where silent failures would be problematic.

### Options
- Let LLM failures propagate directly to the user
- Implement retry mechanisms with exponential backoff
- Use rule-based fallback strategies
- Ignore failures and skip recommendation generation

### Decision
We implemented a comprehensive fallback strategy that defaults to rule-based advisors when LLM calls fail.

### Tradeoffs
**Pros:**
- Ensures consistent recommendation generation even when AI services are unavailable
- Provides clear error logging for troubleshooting
- Maintains system reliability and user experience
- Validates LLM responses to prevent corrupt data

**Cons:**
- Increased complexity in error handling code
- Potential delays when retrying failed LLM calls
- Rule-based fallback might be less sophisticated than AI recommendations

## 5. Agentic loop trigger and decoupling

### Context
Inventory changes should trigger suggestions automatically without blocking the HTTP response. The system needs to detect threshold crossings and generate recommendations asynchronously while avoiding duplicate suggestions.

### Options
- Direct synchronous calls that block HTTP responses
- Event-driven with async processing and idempotency
- Scheduled polling mechanism
- Hybrid approach combining multiple techniques

### Decision
We chose event-driven with async processing and idempotency. Stock updates and order events emit events that are processed asynchronously by event listeners, ensuring immediate HTTP responses while still generating suggestions in the background.

### Tradeoffs
**Pros:**
- Non-blocking HTTP responses for better user experience
- Automatic suggestion generation without manual intervention
- Idempotency prevents duplicate suggestions for the same trigger
- Scalable architecture that can handle high volume of events

**Cons:**
- Increased complexity in implementation
- Need for careful idempotency handling
- Potential for race conditions in concurrent environments

## 6. Extensibility and exclusions

### Context
The system should support future enhancements like competitor pricing, margin floors, and supplier catalogs. We needed to identify clear extension points in the current design while being deliberate about what to exclude from this sprint.

### Options
- Build generic interfaces with clear extension points
- Implement specific features tied to current requirements
- Defer all design decisions for future refactoring
- Create detailed roadmaps for all possible extensions

### Decision
We implemented abstract advisor interfaces with clear extension points while deliberately excluding advanced features to maintain focus. Both RuleAdvisor and AIAdvisor implement the same interface, making it straightforward to add new advisor strategies like CompetitorAwareStrategy.

### Tradeoffs
**Pros:**
- Clear path for future enhancements without major refactorings
- Follows open/closed principle for better maintainability
- Extension points are visible in current codebase
- Maintains focus on core agentic loop functionality

**Cons:**
- Initial abstraction cost
- Slightly more complex initial implementation
- May need adjustments as new requirements emerge