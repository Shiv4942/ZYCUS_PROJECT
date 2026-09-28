import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || `Request failed with status ${response.status}`)
  }

  return response.json()
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function triggerLabel(trigger) {
  return trigger?.replaceAll('_', ' ') || 'MANUAL'
}

function App() {
  const [products, setProducts] = useState([])
  const [pricingSuggestions, setPricingSuggestions] = useState([])
  const [reorderSuggestions, setReorderSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)
    try {
      const [productData, pricingData, reorderData] = await Promise.all([
        request('/products'),
        request('/suggestions/pricing'),
        request('/suggestions/reorder'),
      ])
      setProducts(productData)
      setPricingSuggestions(pricingData.filter((item) => item.status === 'PENDING'))
      setReorderSuggestions(reorderData.filter((item) => item.status === 'PENDING'))
      setLastUpdated(new Date())
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(true)
    const interval = window.setInterval(() => loadData(), 5000)
    return () => window.clearInterval(interval)
  }, [loadData])

  const pendingCount = pricingSuggestions.length + reorderSuggestions.length
  const lowStockCount = products.filter((product) => product.stockLevel < product.reorderThreshold).length
  const averageVelocity = products.length
    ? (products.reduce((total, product) => total + product.demandVelocity, 0) / products.length).toFixed(1)
    : '0.0'

  const suggestions = useMemo(() => [
    ...pricingSuggestions.map((suggestion) => ({ ...suggestion, type: 'Pricing', key: `price-${suggestion._id}` })),
    ...reorderSuggestions.map((suggestion) => ({ ...suggestion, type: 'Reorder', key: `reorder-${suggestion._id}` })),
  ], [pricingSuggestions, reorderSuggestions])

  async function simulateSale(productId) {
    setBusyId(productId)
    try {
      await request(`/products/${productId}/orders`, { method: 'POST', body: JSON.stringify({ quantity: 1 }) })
      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  async function createSuggestion(productId, type) {
    setBusyId(`${type}-${productId}`)
    try {
      await request(`/products/${productId}/suggest-${type}`, { method: 'POST' })
      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  async function updateSuggestion(suggestion, status) {
    const endpoint = suggestion.type === 'Pricing' ? 'pricing-suggestions' : 'reorder-suggestions'
    setBusyId(suggestion._id)
    try {
      await request(`/suggestions/${endpoint}/${suggestion._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar"><div className="brand"><span className="brand-mark">SP</span><span>StockPulse</span></div><div className="topbar-meta"><span className="live-dot" /> Live operations <button className="refresh-button" onClick={() => loadData(true)}>Refresh</button></div></header>
      <section className="hero-row"><div><p className="eyebrow">MERCHANDISING CONTROL ROOM / 01</p><h1>Decisions before<br /><em>inventory runs out.</em></h1><p className="hero-copy">Monitor stock signals, review AI recommendations, and keep every price change human-approved.</p></div><div className="hero-note"><span className="note-kicker">SYSTEM STATUS</span><strong>{loading ? 'Syncing signals...' : 'Recommendation engine online'}</strong><span>Polling every 5 seconds</span></div></section>
      {error && <div className="error-banner" role="alert">{error}<button onClick={() => setError('')}>Dismiss</button></div>}
      <section className="metrics" aria-label="Inventory summary"><div className="metric-card"><span>Catalog SKUs</span><strong>{products.length.toString().padStart(2, '0')}</strong><small>Active inventory</small></div><div className="metric-card metric-alert"><span>Pending actions</span><strong>{pendingCount.toString().padStart(2, '0')}</strong><small>Awaiting approval</small></div><div className="metric-card"><span>Low stock</span><strong>{lowStockCount.toString().padStart(2, '0')}</strong><small>Needs attention</small></div><div className="metric-card"><span>Avg. velocity</span><strong>{averageVelocity}</strong><small>Orders / 24h</small></div></section>
      <div className="content-grid"><section className="panel inventory-panel"><div className="panel-heading"><div><p className="eyebrow">INVENTORY SIGNALS</p><h2>Catalog overview</h2></div><span className="panel-count">{products.length} products</span></div><div className="table-wrap"><table><thead><tr><th>Product</th><th>Stock health</th><th>Velocity</th><th>Price</th><th>Actions</th></tr></thead><tbody>{products.map((product) => { const low = product.stockLevel < product.reorderThreshold; return <tr key={product._id}><td><div className="product-name">{product.name}</div><div className="product-meta">{product.sku} / {product.category}</div></td><td><div className="stock-line"><strong className={low ? 'low' : ''}>{product.stockLevel}</strong><span> / {product.reorderThreshold}</span></div><div className="stock-bar"><span className={low ? 'low-bar' : ''} style={{ width: `${Math.min(100, (product.stockLevel / Math.max(product.reorderThreshold * 2, 1)) * 100)}%` }} /></div></td><td><span className="velocity">{product.demandVelocity}<small> / day</small></span></td><td className="price">{formatCurrency(product.currentPrice)}</td><td><div className="row-actions"><button className="sale-button" disabled={busyId === product._id} onClick={() => simulateSale(product._id)}>+ Simulate sale</button><button className="icon-button" title="Create manual pricing suggestion" disabled={busyId === `pricing-${product._id}`} onClick={() => createSuggestion(product._id, 'pricing')}>Price</button></div></td></tr> })}{!loading && products.length === 0 && <tr><td colSpan="5" className="empty-state">No products found. Seed the backend to populate the catalog.</td></tr>}</tbody></table></div></section><aside className="panel suggestions-panel"><div className="panel-heading"><div><p className="eyebrow">HUMAN CHECKPOINT</p><h2>Approval queue</h2></div><span className="queue-badge">{pendingCount}</span></div><div className="suggestion-list">{suggestions.map((suggestion) => <article className="suggestion-card" key={suggestion.key}><div className="suggestion-top"><span className={`type-label ${suggestion.type.toLowerCase()}`}>{suggestion.type}</span><span className="trigger-badge">{triggerLabel(suggestion.triggerReason)}</span></div><h3>{suggestion.product?.name || 'Product'}</h3><div className="recommendation"><strong>{suggestion.type === 'Pricing' ? formatCurrency(suggestion.recommendedPrice) : `+${suggestion.recommendedQuantity} units`}</strong><span>{suggestion.type === 'Pricing' ? `${suggestion.changeDirection} recommendation` : `${suggestion.suggestedLeadTimeDays} day lead time`}</span></div><p className="reasoning">{suggestion.reasoning}</p><div className="confidence"><span>Confidence</span><strong>{Math.round(suggestion.confidence * 100)}%</strong><div><i style={{ width: `${suggestion.confidence * 100}%` }} /></div></div><div className="suggestion-actions"><button className="approve-button" disabled={busyId === suggestion._id} onClick={() => updateSuggestion(suggestion, 'ACCEPTED')}>Approve</button><button className="reject-button" disabled={busyId === suggestion._id} onClick={() => updateSuggestion(suggestion, 'REJECTED')}>Reject</button></div></article>)}{!loading && suggestions.length === 0 && <div className="empty-queue"><span>OK</span><strong>Queue is clear</strong><p>Trigger a sale or create a manual recommendation to see it here.</p></div>}</div></aside></div>
      <footer>StockPulse / Decision support for modern commerce <span>{lastUpdated ? `Last sync ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Waiting for sync'}</span></footer>
    </main>
  )
}

export default App
