import { useEffect, useMemo, useRef, useState } from 'react'
import BrandMark from './BrandMark.jsx'
import { supabase } from './lib/supabase.js'
import './Trade.css'

const assets = [
  { symbol: 'BTCUSD', ticker: 'BTC', name: 'Bitcoin / U.S. Dollar', price: 67432.18, change: 2.45, mark: '₿', color: '#f7931a' },
  { symbol: 'XAUUSD', ticker: 'XAU', name: 'Gold / U.S. Dollar', price: 2380.45, change: 0.72, mark: 'Au', color: '#e5bd55' },
  { symbol: 'XAGUSD', ticker: 'XAG', name: 'Silver / U.S. Dollar', price: 29.84, change: 1.14, mark: 'Ag', color: '#aab5c5' },
  { symbol: 'GBPUSD', ticker: 'GBP', name: 'British Pound / U.S. Dollar', price: 1.2746, change: 0.23, mark: '£', color: '#6aa7f5' },
  { symbol: 'USOIL', ticker: 'OIL', name: 'U.S. Crude Oil', price: 78.36, change: -0.48, mark: 'O', color: '#8bc34a' },
  { symbol: 'USDJPY', ticker: 'JPY', name: 'U.S. Dollar / Japanese Yen', price: 155.72, change: -0.31, mark: '¥', color: '#ef7777' },
  { symbol: 'EURUSD', ticker: 'EUR', name: 'Euro / U.S. Dollar', price: 1.0842, change: 0.18, mark: '€', color: '#6aa7f5' },
]

const intervals = ['1m', '5m', '15m', '1h', '4h', '1D', '1W']
const tradingViewSymbols = {
  BTCUSD: 'BINANCE:BTCUSDT',
  XAUUSD: 'OANDA:XAUUSD',
  XAGUSD: 'OANDA:XAGUSD',
  GBPUSD: 'OANDA:GBPUSD',
  USDJPY: 'OANDA:USDJPY',
  USOIL: 'TVC:USOIL',
  EURUSD: 'FX:EURUSD',
}

const tradingViewIntervals = {
  '1m': '1',
  '5m': '5',
  '15m': '15',
  '1h': '60',
  '4h': '240',
  '1D': 'D',
  '1W': 'W',
}

const yahooSymbols = {
  BTCUSD: 'BTC-USD',
  XAUUSD: 'GC=F',
  XAGUSD: 'SI=F',
  GBPUSD: 'GBPUSD=X',
  USDJPY: 'JPY=X',
  USOIL: 'CL=F',
  EURUSD: 'EURUSD=X',
}

function formatPrice(value, symbol) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0
  const assetSymbol = symbol ?? 'USD'
  const isFxPair = assetSymbol === 'GBPUSD' || assetSymbol === 'EURUSD' || assetSymbol === 'USDJPY'
  const digits = assetSymbol === 'USDJPY' ? 3 : safeValue < 10 ? 4 : 2
  const formatted = safeValue.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  return isFxPair ? formatted : `$${formatted}`
}

function getNextBarClose(now, interval) {
  const intervalMinutes = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '1h': 60,
    '4h': 240,
    '1D': 1440,
  }[interval]

  if (interval === '1W') {
    const nextMonday = new Date(now)
    nextMonday.setUTCHours(0, 0, 0, 0)
    const daysUntilMonday = (8 - nextMonday.getUTCDay()) % 7 || 7
    nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday)
    return nextMonday.getTime()
  }

  const intervalMs = intervalMinutes * 60 * 1000
  return (Math.floor(now / intervalMs) + 1) * intervalMs
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const clock = [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
  return days > 0 ? `${days}d ${clock}` : clock
}

function getAssetClass(symbol) {
  if (symbol === 'BTCUSD') return 'Crypto'
  if (symbol === 'XAUUSD' || symbol === 'XAGUSD') return 'Metals'
  if (symbol === 'USOIL') return 'Energy'
  return 'Forex'
}

function MarketOverview({ active }) {
  const widgetRef = useRef(null)
  const [widgetError, setWidgetError] = useState(false)

  useEffect(() => {
    const container = widgetRef.current
    if (!active || !container || container.dataset.widgetMounted === 'true') return undefined

    container.dataset.widgetMounted = 'true'
    setWidgetError(false)
    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget'
    widget.style.height = '100%'
    widget.style.width = '100%'
    container.append(widget)

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'
    script.type = 'text/javascript'
    script.async = true
    script.textContent = JSON.stringify({
      colorTheme: 'dark',
      dateRange: '12M',
      showChart: true,
      locale: 'en',
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: '100%',
      height: '620',
      tabs: [
        { title: 'Indices', symbols: [{ s: 'FOREXCOM:SPXUSD', d: 'S&P 500' }, { s: 'FOREXCOM:NSXUSD', d: 'Nasdaq 100' }, { s: 'TVC:DJI', d: 'Dow Jones' }, { s: 'XETR:DAX', d: 'DAX' }] },
        { title: 'Forex', symbols: [{ s: 'FX:EURUSD', d: 'EUR / USD' }, { s: 'OANDA:GBPUSD', d: 'GBP / USD' }, { s: 'OANDA:USDJPY', d: 'USD / JPY' }, { s: 'FX:AUDUSD', d: 'AUD / USD' }] },
        { title: 'Crypto', symbols: [{ s: 'BINANCE:BTCUSDT', d: 'Bitcoin' }, { s: 'BINANCE:ETHUSDT', d: 'Ethereum' }, { s: 'BINANCE:SOLUSDT', d: 'Solana' }] },
        { title: 'Commodities', symbols: [{ s: 'OANDA:XAUUSD', d: 'Gold' }, { s: 'OANDA:XAGUSD', d: 'Silver' }, { s: 'TVC:USOIL', d: 'Crude Oil' }] },
      ],
    })
    script.onerror = () => setWidgetError(true)
    container.append(script)
  }, [active])

  return (
    <section className="workspace-page markets-page" hidden={!active}>
      <div className="workspace-page-heading">
        <div><p className="workspace-eyebrow">LIVE MARKET DATA</p><h1>Market overview</h1><p>Explore indices, forex, crypto, and commodities in a TradingView market widget.</p></div>
        <span className="workspace-demo-badge live-badge"><i /> TRADINGVIEW WIDGET</span>
      </div>
      <div className="market-widget-panel">
        {widgetError
          ? <div className="widget-fallback" role="status"><strong>Market widget could not load.</strong><span>Check your connection or open TradingView directly.</span><a href="https://www.tradingview.com/markets/" target="_blank" rel="noopener noreferrer">Open TradingView Markets ↗</a></div>
          : <div className="tradingview-widget-container market-overview-widget" ref={widgetRef} aria-label="TradingView live market overview" />}
      </div>
      <p className="market-widget-attribution">Market overview powered by <a href="https://www.tradingview.com/markets/" target="_blank" rel="noopener noreferrer">TradingView ↗</a>.</p>
      <p className="workspace-disclaimer">Market data is provided by TradingView and may be delayed or subject to exchange restrictions. This is not investment advice.</p>
    </section>
  )
}

function LeaderboardPage({ user }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const userId = user?.id

  useEffect(() => {
    if (!userId || !supabase) return undefined

    let isCurrentRequest = true

    async function loadLeaderboard() {
      setLoading(true)
      setError('')
      const { data, error: requestError } = await supabase
        .from('leaderboard')
        .select('id, player, score, created_at')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(50)

      if (!isCurrentRequest) return
      if (requestError) {
        setError(requestError.message)
        setPlayers([])
      } else {
        setPlayers(data ?? [])
      }
      setLoading(false)
    }

    loadLeaderboard()
    return () => {
      isCurrentRequest = false
    }
  }, [userId, refreshKey])

  return (
    <section className="workspace-page leaderboard-page">
      <div className="workspace-page-heading">
        <div><p className="workspace-eyebrow">COMMUNITY</p><h1>Leaderboard</h1><p>Top scores from the Northstar community.</p></div>
        {user && <button className="leaderboard-refresh" type="button" onClick={() => setRefreshKey((key) => key + 1)} disabled={loading}>Refresh</button>}
      </div>
      {!user
        ? <div className="workspace-panel leaderboard-message" role="status">Sign in to view the leaderboard.</div>
        : !supabase
          ? <div className="workspace-panel leaderboard-message" role="status">Connect Supabase to load leaderboard scores.</div>
          : loading
            ? <div className="workspace-panel leaderboard-message" role="status">Loading leaderboard…</div>
            : error
              ? <div className="workspace-panel leaderboard-message leaderboard-error" role="alert">
                  <strong>Could not load the leaderboard.</strong>
                  <span>{error}</span>
                  <span>Check that the leaderboard table and its authenticated read policy are set up in Supabase.</span>
                </div>
              : (
                <div className="workspace-panel leaderboard-panel">
                  <div className="screener-table-wrap">
                    <table className="screener-table leaderboard-table">
                      <thead><tr><th>RANK</th><th>PLAYER</th><th>SCORE</th><th>ADDED</th></tr></thead>
                      <tbody>
                        {players.map((player, index) => (
                          <tr key={player.id}>
                            <td>#{index + 1}</td>
                            <td>{player.player}</td>
                            <td className="leaderboard-score">{Number(player.score).toLocaleString()}</td>
                            <td>{player.created_at ? new Date(player.created_at).toLocaleDateString() : '—'}</td>
                          </tr>
                        ))}
                        {players.length === 0 && <tr><td className="screener-empty" colSpan="4">No scores yet. Add sample scores using the Supabase SQL setup.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <p className="workspace-disclaimer">Scores are community-submitted demo data and are not linked to real trading performance.</p>
                </div>
              )}
    </section>
  )
}

function ScreenerPage({ onSelectAsset }) {
  const [query, setQuery] = useState('')
  const [assetClass, setAssetClass] = useState('All markets')
  const [performance, setPerformance] = useState('Any change')
  const [sortBy, setSortBy] = useState('change')

  const visibleAssets = assets
    .filter((asset) => `${asset.symbol} ${asset.name}`.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((asset) => assetClass === 'All markets' || getAssetClass(asset.symbol) === assetClass)
    .filter((asset) => performance === 'Any change' || (performance === 'Gainers' ? asset.change >= 0 : asset.change < 0))
    .sort((left, right) => {
      if (sortBy === 'price') return right.price - left.price
      if (sortBy === 'name') return left.name.localeCompare(right.name)
      return right.change - left.change
    })

  return (
    <section className="workspace-page screener-page">
      <div className="workspace-page-heading">
        <div><p className="workspace-eyebrow">MARKET TOOLS</p><h1>Market screener</h1><p>Filter the sample markets and open a symbol on the interactive chart.</p></div>
        <span className="workspace-demo-badge"><i /> SAMPLE QUOTES</span>
      </div>
      <div className="screener-summary">
        <article><span>Markets covered</span><strong>{assets.length}</strong><small>Across four asset classes</small></article>
        <article><span>Positive sample moves</span><strong className="up-text">{assets.filter((asset) => asset.change >= 0).length}</strong><small>Illustrative daily changes</small></article>
        <article><span>Largest sample move</span><strong className="up-text">+{Math.max(...assets.map((asset) => asset.change)).toFixed(2)}%</strong><small>{assets.find((asset) => asset.change === Math.max(...assets.map((item) => item.change)))?.symbol}</small></article>
      </div>
      <div className="workspace-panel screener-panel">
        <div className="screener-controls">
          <label className="screener-search"><span aria-hidden="true">⌕</span><input aria-label="Search markets" placeholder="Search symbols or names" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label className="filter-field"><span>Market</span><select value={assetClass} onChange={(event) => setAssetClass(event.target.value)}><option>All markets</option><option>Crypto</option><option>Metals</option><option>Forex</option><option>Energy</option></select></label>
          <label className="filter-field"><span>Daily move</span><select value={performance} onChange={(event) => setPerformance(event.target.value)}><option>Any change</option><option>Gainers</option><option>Losers</option></select></label>
          <label className="filter-field"><span>Sort by</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="change">Daily change</option><option value="price">Price</option><option value="name">Name</option></select></label>
        </div>
        <div className="screener-table-wrap">
          <table className="screener-table">
            <thead><tr><th>SYMBOL</th><th>MARKET</th><th>LAST*</th><th>24H CHANGE*</th><th>CHART</th></tr></thead>
            <tbody>
              {visibleAssets.map((asset) => (
                <tr key={asset.symbol}>
                  <td><span className="screener-symbol"><span className="asset-mark small-mark" style={{ '--asset-color': asset.color }}>{asset.mark}</span><span><strong>{asset.symbol}</strong><small>{asset.name}</small></span></span></td>
                  <td><span className="market-type-pill">{getAssetClass(asset.symbol)}</span></td>
                  <td>{formatPrice(asset.price, asset.symbol)}</td>
                  <td className={asset.change >= 0 ? 'up-text' : 'down-text'}>{asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%</td>
                  <td><button className="open-chart-button" type="button" onClick={() => onSelectAsset(asset.symbol)}>Open chart ↗</button></td>
                </tr>
              ))}
              {visibleAssets.length === 0 && <tr><td className="screener-empty" colSpan="5">No symbols match the selected filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="workspace-disclaimer">* Sample values are for interface demonstration only and are not live quotes or investment signals.</p>
      </div>
    </section>
  )
}

const ideaCards = [
  { id: 'trend-following', category: 'Technical analysis', icon: '↗', title: 'Build a simple trend-following checklist', description: 'Explore how traders compare moving averages, swing highs and lows, and volume before defining a trend. Treat each signal as a hypothesis, not a prediction.', tags: ['Trend', 'Moving averages'], symbol: 'BTCUSD' },
  { id: 'mean-reversion', category: 'Technical analysis', icon: '⟲', title: 'Study mean reversion across timeframes', description: 'Compare how far price has moved from a recent average, then look at whether that behavior differs across short and long timeframes.', tags: ['Research', 'Timeframes'], symbol: 'XAUUSD' },
  { id: 'breakout-journal', category: 'Trading journal', icon: '⇧', title: 'Create a breakout observation journal', description: 'Record the level you are watching, what would invalidate the idea, and what happened after the move. Reviewing a journal can reveal whether a setup is consistent.', tags: ['Process', 'Journal'], symbol: 'USOIL' },
  { id: 'risk-first', category: 'Risk & learning', icon: '◇', title: 'Write the risk plan before the trade idea', description: 'Practice defining a hypothetical risk limit, position size, and exit conditions before analyzing a possible entry. Never risk money you cannot afford to lose.', tags: ['Risk', 'Planning'], symbol: 'GBPUSD' },
  { id: 'market-comparison', category: 'Market research', icon: '⇄', title: 'Compare related markets side by side', description: 'Observe how instruments in different asset classes respond to the same broad market session. Correlation can change and does not guarantee future behavior.', tags: ['Comparison', 'Research'], symbol: 'USDJPY' },
  { id: 'weekly-review', category: 'Trading journal', icon: '▦', title: 'Make a weekly market review routine', description: 'Summarize what changed, what surprised you, and what you still do not know. A repeatable review keeps observations separate from assumptions.', tags: ['Routine', 'Reflection'], symbol: 'EURUSD' },
]

function IdeasPage({ onSelectAsset }) {
  const [category, setCategory] = useState('All ideas')
  const [query, setQuery] = useState('')
  const [savedIdeas, setSavedIdeas] = useState([])
  const categories = ['All ideas', 'Technical analysis', 'Risk & learning', 'Trading journal', 'Market research']
  const filteredIdeas = ideaCards.filter((idea) =>
    (category === 'All ideas' || idea.category === category)
      && `${idea.title} ${idea.description} ${idea.tags.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  function toggleSaved(id) {
    setSavedIdeas((current) => current.includes(id)
      ? current.filter((savedId) => savedId !== id)
      : [...current, id])
  }

  return (
    <section className="workspace-page ideas-page">
      <div className="workspace-page-heading">
        <div><p className="workspace-eyebrow">EXPLORE & LEARN</p><h1>Market ideas</h1><p>Educational prompts for research, chart practice, and building a thoughtful process.</p></div>
        <span className="workspace-demo-badge"><i /> EDUCATIONAL</span>
      </div>
      <div className="ideas-callout"><span className="ideas-callout-icon">✦</span><p><strong>Use these as learning prompts, not trade recommendations.</strong><span>Ideas are illustrative and do not predict prices or guarantee outcomes.</span></p></div>
      <div className="ideas-controls">
        <div className="idea-categories" aria-label="Filter idea categories">
          {categories.map((item) => <button type="button" key={item} className={category === item ? 'selected' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <label className="screener-search idea-search"><span aria-hidden="true">⌕</span><input aria-label="Search ideas" placeholder="Search ideas" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      </div>
      <div className="idea-grid">
        {filteredIdeas.map((idea) => {
          const isSaved = savedIdeas.includes(idea.id)
          return (
            <article className="idea-card" key={idea.id}>
              <div className="idea-card-top"><span className="idea-icon">{idea.icon}</span><button type="button" className={`save-idea-button ${isSaved ? 'saved' : ''}`} aria-pressed={isSaved} onClick={() => toggleSaved(idea.id)}>{isSaved ? '★ Saved' : '☆ Save'}</button></div>
              <span className="idea-category">{idea.category}</span>
              <h2>{idea.title}</h2>
              <p>{idea.description}</p>
              <div className="idea-tags">{idea.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <button type="button" className="idea-chart-link" onClick={() => onSelectAsset(idea.symbol)}>Explore {idea.symbol} chart <span aria-hidden="true">→</span></button>
            </article>
          )
        })}
        {filteredIdeas.length === 0 && <p className="ideas-empty">No ideas found. Try another category or search.</p>}
      </div>
      <p className="workspace-disclaimer">Saved ideas are kept only for this page session. Nothing here is personalized financial advice.</p>
    </section>
  )
}

function Trade({ user, onAuthNavigation, onAccountNavigation, onLegalNavigation }) {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD')
  const [activePage, setActivePage] = useState('Chart')
  const [interval, setInterval] = useState('1h')
  const [clock, setClock] = useState(() => Date.now())
  const [activeTab, setActiveTab] = useState('Watchlist')
  const [search, setSearch] = useState('')
  const [orderSide, setOrderSide] = useState('Buy')
  const [quantity, setQuantity] = useState('0.01')
  const [notice, setNotice] = useState('')
  const [favoriteSymbols, setFavoriteSymbols] = useState(assets.map((asset) => asset.symbol))
  const [watchlistSort, setWatchlistSort] = useState('default')
  const [platformMenuOpen, setPlatformMenuOpen] = useState(false)
  const [addSymbolsOpen, setAddSymbolsOpen] = useState(false)
  const [chartIsFullscreen, setChartIsFullscreen] = useState(false)
  const chartWorkspaceRef = useRef(null)
  const selectedAsset = assets.find((asset) => asset.symbol === selectedSymbol) ?? assets[0]
  const chartUrl = useMemo(() => {
    const parameters = new URLSearchParams({
      symbol: tradingViewSymbols[selectedAsset.symbol],
      interval: tradingViewIntervals[interval],
      theme: 'dark',
      style: '1',
      locale: 'en',
      hide_top_toolbar: '0',
      hide_side_toolbar: '0',
      allow_symbol_change: '1',
      save_image: '0',
      calendar: '0',
      details: '0',
      hotlist: '0',
      symboledit: '1',
      toolbarbg: '101318',
      withdateranges: '1',
    })
    return `https://s.tradingview.com/widgetembed/?${parameters.toString()}`
  }, [selectedAsset, interval])
  const platformLinks = [
    { name: 'TradingView', url: `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tradingViewSymbols[selectedAsset.symbol])}` },
    { name: 'Yahoo Finance', url: `https://finance.yahoo.com/quote/${encodeURIComponent(yahooSymbols[selectedAsset.symbol] ?? selectedAsset.symbol)}/` },
    ...(selectedAsset.symbol === 'BTCUSD'
      ? [
          { name: 'Coinbase Advanced', url: `https://www.coinbase.com/advanced-trade/spot/${selectedAsset.ticker}-USD` },
          { name: 'Binance', url: `https://www.binance.com/en/trade/${selectedAsset.ticker}_USDT?type=spot` },
        ]
      : []),
  ]
  const searchResults = assets.filter((asset) =>
    `${asset.name} ${asset.symbol}`.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const filteredAssets = searchResults.filter((asset) => favoriteSymbols.includes(asset.symbol))
  const sortedAssets = [...filteredAssets].sort((first, second) => {
    if (watchlistSort === 'symbol') return first.symbol.localeCompare(second.symbol)
    if (watchlistSort === 'price-high') return second.price - first.price
    if (watchlistSort === 'price-low') return first.price - second.price
    if (watchlistSort === 'change-high') return second.change - first.change
    if (watchlistSort === 'change-low') return first.change - second.change
    return 0
  })
  const availableAssets = searchResults.filter((asset) => !favoriteSymbols.includes(asset.symbol))
  const orderTotal = Number(quantity) > 0 ? Number(quantity) * selectedAsset.price : 0
  const barCountdown = formatCountdown(getNextBarClose(clock, interval) - clock)

  useEffect(() => {
    const timerId = window.setInterval(() => setClock(Date.now()), 1000)
    function syncFullscreenState() {
      setChartIsFullscreen(document.fullscreenElement === chartWorkspaceRef.current)
    }

    document.addEventListener('fullscreenchange', syncFullscreenState)
    return () => {
      window.clearInterval(timerId)
      document.removeEventListener('fullscreenchange', syncFullscreenState)
    }
  }, [])

  function toggleFavorite(symbol) {
    setFavoriteSymbols((current) => current.includes(symbol)
      ? current.filter((item) => item !== symbol)
      : [...current, symbol])
  }

  function previewOrder(event) {
    event.preventDefault()
    if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      setNotice('Enter a quantity greater than zero to preview this sample order.')
      return
    }
    setNotice(`${orderSide} preview: ${quantity} ${selectedAsset.ticker} · estimated ${formatPrice(orderTotal, selectedAsset.symbol)}. Demo only; no order was placed.`)
  }

  async function toggleChartFullscreen() {
    const chartWorkspace = chartWorkspaceRef.current
    if (!chartWorkspace) return

    try {
      if (document.fullscreenElement === chartWorkspace) {
        await document.exitFullscreen()
      } else if (chartWorkspace.requestFullscreen) {
        await chartWorkspace.requestFullscreen()
      } else {
        setNotice('Fullscreen mode is not supported by this browser.')
      }
    } catch (error) {
      setNotice(`Could not change chart fullscreen: ${error.message}`)
    }
  }

  async function signOut() {
    if (!supabase) return

    const { error } = await supabase.auth.signOut()
    if (error) {
      setNotice(`Sign out failed: ${error.message}`)
      return
    }
    setNotice('You have signed out.')
  }

  return (
    <main className="terminal">
      <header className="terminal-header">
        <a className="terminal-brand" href="#chart" aria-label="Northstar chart workspace">
          <BrandMark className="brand-mark" /><strong>northstar<span>.</span></strong>
        </a>
        <nav className="header-links" aria-label="Workspace sections">
          {['Chart', 'Markets', 'Screener', 'Ideas', 'Leaderboard'].map((page) => (
            <button type="button" key={page} className={`header-link ${activePage === page ? 'active' : ''}`} aria-current={activePage === page ? 'page' : undefined} onClick={() => setActivePage(page)}>{page}</button>
          ))}
          <button type="button" className="header-link" onClick={onAccountNavigation}>Account</button>
        </nav>
        <div className="header-right">
          <span className="data-status"><i /> LIVE CHART · SAMPLE QUOTES</span>
          <button className="layout-button" type="button" onClick={() => setNotice('Chart layout saved for this demo session.')}>▦ <span>Save layout</span></button>
          {user
            ? <>
                <span className="terminal-user-email" title={user.email}>{user.email}</span>
                <button className="auth-nav-button" type="button" onClick={signOut}>Sign out</button>
                <span className="terminal-avatar" aria-label="Signed-in user">{user.email?.charAt(0).toUpperCase() ?? 'U'}</span>
              </>
            : <>
                <button className="auth-nav-button" type="button" onClick={() => onAuthNavigation('login')}>Sign in</button>
                <button className="auth-nav-button primary" type="button" onClick={() => onAuthNavigation('signup')}>Sign up</button>
                <span className="terminal-avatar">JD</span>
              </>}
        </div>
      </header>

      {activePage === 'Chart' && <div className="symbol-strip">
        <div className="symbol-picker">
          <span className="asset-mark terminal-asset-mark" style={{ '--asset-color': selectedAsset.color }}>{selectedAsset.mark}</span>
          <div className="symbol-title">
            <label className="visually-hidden" htmlFor="chart-symbol">Select chart symbol</label>
            <select id="chart-symbol" className="symbol-select" value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value)}>
              {assets.map((asset) => <option value={asset.symbol} key={asset.symbol}>{asset.symbol}</option>)}
            </select>
            <span>{selectedAsset.name}</span>
          </div>
        </div>
        <span className="strip-divider" />
        <span className="current-quote">{formatPrice(selectedAsset.price, selectedAsset.symbol)}</span>
        <span className={`quote-change ${selectedAsset.change >= 0 ? 'up-text' : 'down-text'}`}>{selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change.toFixed(2)}%</span>
        <span className="strip-divider" />
        <div className="interval-picker" aria-label="Chart interval">
          {intervals.map((item) => <button type="button" key={item} className={interval === item ? 'chosen' : ''} onClick={() => setInterval(item)} aria-pressed={interval === item}>{item}</button>)}
        </div>
        <span className="strip-divider interval-divider" />
        <span className="strip-spacer" />
        <a className="alert-button" href={platformLinks[0].url} target="_blank" rel="noopener noreferrer" title="Open TradingView to create an alert">＋ <span>Alert in TradingView ↗</span></a>
        <button type="button" className="favorite-button" onClick={() => toggleFavorite(selectedSymbol)} aria-label={favoriteSymbols.includes(selectedSymbol) ? 'Remove from watchlist' : 'Add to watchlist'}>{favoriteSymbols.includes(selectedSymbol) ? '★' : '☆'}</button>
      </div>}

      {activePage === 'Chart' ? <div className="terminal-body">
        <aside className="watchlist-rail">
          <div className="rail-heading"><span>MARKETS</span><button type="button" aria-label={addSymbolsOpen ? 'Close add symbols' : 'Add symbols to watchlist'} aria-expanded={addSymbolsOpen} onClick={() => setAddSymbolsOpen((open) => !open)}>＋</button></div>
          <label className="market-search"><span aria-hidden="true">⌕</span><input aria-label="Search markets" placeholder="Search symbols" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <label className="watchlist-sort"><span>Sort</span><select aria-label="Sort watchlist" value={watchlistSort} onChange={(event) => setWatchlistSort(event.target.value)}>
            <option value="default">Default order</option>
            <option value="symbol">Symbol A–Z</option>
            <option value="price-high">Price: high to low</option>
            <option value="price-low">Price: low to high</option>
            <option value="change-high">Change: high to low</option>
            <option value="change-low">Change: low to high</option>
          </select></label>
          {addSymbolsOpen && (
            <div className="add-symbols-panel">
              <span className="add-symbols-title">ADD TO WATCHLIST</span>
              {availableAssets.length > 0
                ? availableAssets.map((asset) => (
                    <button type="button" key={asset.symbol} className="add-symbol-row" onClick={() => { toggleFavorite(asset.symbol); setSelectedSymbol(asset.symbol) }}>
                      <span>{asset.symbol}<small>{asset.name}</small></span><strong>＋</strong>
                    </button>
                  ))
                : <p className="no-add-symbols">{searchResults.length ? 'All matching symbols are already in your watchlist.' : 'No symbols match your search.'}</p>}
            </div>
          )}
          <div className="watchlist-columns"><span>SYMBOL</span><span>LAST*</span><span>24H*</span></div>
          <div className="watchlist-rows">
            {sortedAssets.map((asset) => (
              <button type="button" key={asset.symbol} className={`market-row ${asset.symbol === selectedSymbol ? 'selected' : ''}`} onClick={() => setSelectedSymbol(asset.symbol)}>
                <span className="row-asset"><span className="asset-mark small-mark" style={{ '--asset-color': asset.color }}>{asset.mark}</span><span><strong>{asset.ticker}</strong><small>{asset.symbol}</small></span></span>
                <span className="row-price">{formatPrice(asset.price, asset.symbol)}</span>
                <span className={`row-change ${asset.change >= 0 ? 'up-text' : 'down-text'}`}>{asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%</span>
              </button>
            ))}
            {filteredAssets.length === 0 && <p className="no-symbols">{searchResults.length ? 'No matching watchlist symbols. Use + to add one.' : 'No symbols match your search.'}</p>}
          </div>
          <div className="rail-footnote"><span className="pulse-dot" /> Market session simulated</div>
        </aside>

        <section className="chart-workspace" id="chart" aria-label="Chart workspace" ref={chartWorkspaceRef}>
          <div className="chart-toolbar">
            <span className="chart-source"><i /> TradingView interactive chart</span>
            <span className="toolbar-spacer" />
            <button
              type="button"
              className="chart-fullscreen-button"
              onClick={toggleChartFullscreen}
              aria-label={chartIsFullscreen ? 'Exit chart fullscreen' : 'View chart fullscreen'}
              title={chartIsFullscreen ? 'Exit fullscreen (Esc)' : 'View chart fullscreen'}
            >
              <span aria-hidden="true">{chartIsFullscreen ? '↙' : '⛶'}</span>
              <span>{chartIsFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span>
            </button>
            <div className="platform-switcher">
              <button type="button" className="platform-switch-button" aria-expanded={platformMenuOpen} onClick={() => setPlatformMenuOpen((open) => !open)}>Open on <strong>platform</strong> <span aria-hidden="true">⌄</span></button>
              {platformMenuOpen && (
                <div className="platform-menu" role="menu" aria-label="Open this market on another platform">
                  {platformLinks.map((platform) => (
                    <a key={platform.name} href={platform.url} target="_blank" rel="noopener noreferrer" role="menuitem" onClick={() => setPlatformMenuOpen(false)}>
                      {platform.name}<span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="chart-titlebar">
            <div><h1>{selectedAsset.name}</h1><span>{tradingViewSymbols[selectedAsset.symbol]} · {interval} · TradingView</span></div>
          </div>

          <div className="chart-drawing-area">
            <iframe
              key={`${selectedAsset.symbol}-${interval}`}
              className="tradingview-frame"
              src={chartUrl}
              title={`Live TradingView chart for ${selectedAsset.name}`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="chart-statusbar">
            <span><i className="status-dot" /> TradingView chart</span>
            <span className="bar-countdown" title="Estimated from UTC timeframe boundaries; actual exchange session closes may differ." aria-label={`Estimated time until next ${interval} bar: ${barCountdown}`}><span>Next bar · UTC est.</span><strong>{barCountdown}</strong></span>
            <a href={platformLinks[0].url} target="_blank" rel="noopener noreferrer">Open full chart ↗</a>
          </div>

          <div className="bottom-tabs" role="tablist" aria-label="Chart panels">
            {['Watchlist', 'Details', 'News', 'Pine Editor'].map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? 'selected' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}
            <span className="bottom-tabs-spacer" />
            <span className="bottom-market-label"><i /> SAMPLE PORTFOLIO DATA</span>
          </div>
          <div className="bottom-panel">
            {activeTab === 'Watchlist' && <><strong>{selectedAsset.ticker}</strong><span>{selectedAsset.name}</span><span>Last {formatPrice(selectedAsset.price, selectedAsset.symbol)}</span><span className={selectedAsset.change >= 0 ? 'up-text' : 'down-text'}>{selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change.toFixed(2)}% today</span></>}
            {activeTab === 'Details' && <><strong>Instrument details</strong><span>{selectedAsset.name}</span><span>Asset class: {selectedAsset.price < 10 ? 'FX sample' : 'Equity / crypto sample'}</span><span>Exchange: simulated</span></>}
            {activeTab === 'News' && <><strong>Market headlines</strong><span>Sample news feed</span><span>News is not connected in this demo.</span></>}
            {activeTab === 'Pine Editor' && <><strong>Script editor preview</strong><span>Open the full TradingView chart to use its indicators and scripts.</span><a href={platformLinks[0].url} target="_blank" rel="noopener noreferrer">Open TradingView ↗</a></>}
          </div>
        </section>

        <aside className="trade-rail">
          <div className="trade-rail-heading"><strong>Order panel <span className="sample-label">SAMPLE</span></strong><button type="button" aria-label="Order panel options" onClick={() => setNotice('Order panel settings are demo-only.')}>···</button></div>
          <div className="trade-switch" role="group" aria-label="Choose sample order side">
            <button type="button" className={orderSide === 'Buy' ? 'buy selected' : 'buy'} onClick={() => setOrderSide('Buy')}>Buy</button>
            <button type="button" className={orderSide === 'Sell' ? 'sell selected' : 'sell'} onClick={() => setOrderSide('Sell')}>Sell</button>
          </div>
          <label className="trade-label" htmlFor="trade-symbol">Symbol</label>
          <select id="trade-symbol" value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value)}>{assets.map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>)}</select>
          <label className="trade-label" htmlFor="trade-quantity">Quantity</label>
          <div className="trade-quantity"><input id="trade-quantity" type="number" min="0" step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} /><span>{selectedAsset.ticker}</span></div>
          <div className="trade-estimate"><span>Market price</span><strong>{formatPrice(selectedAsset.price, selectedAsset.symbol)}</strong></div>
          <div className="trade-estimate"><span>Est. order value</span><strong>{formatPrice(orderTotal, selectedAsset.symbol)}</strong></div>
          <button className={`preview-order ${orderSide === 'Sell' ? 'sell-order' : ''}`} type="button" onClick={previewOrder}>Preview {orderSide.toLowerCase()}</button>
          <p className="demo-warning">ⓘ Simulated order only. Nothing will be executed.</p>
          <div className="orderbook">
            <div className="orderbook-title"><strong>Sample market depth</strong><span>0.01</span></div>
            <div className="depth-head"><span>PRICE (USD)</span><span>SIZE</span></div>
            {[1.0003, 1.0002, 1.0001].map((factor, index) => {
              const price = selectedAsset.price * factor
              return <div className="depth-row ask" key={factor}><span>{formatPrice(price, selectedAsset.symbol)}</span><span>{['0.482', '0.316', '0.891'][index]}</span></div>
            })}
            <div className="depth-mid">{formatPrice(selectedAsset.price, selectedAsset.symbol)} <span>Spread 0.03%</span></div>
            {[0.9999, 0.9998, 0.9997].map((factor, index) => {
              const price = selectedAsset.price * factor
              return <div className="depth-row bid" key={factor}><span>{formatPrice(price, selectedAsset.symbol)}</span><span>{['0.294', '0.675', '0.521'][index]}</span></div>
            })}
          </div>
          <div className="recent-trades">
            <div className="orderbook-title"><strong>Recent trades</strong><span>DEMO</span></div>
            <div className="depth-head"><span>PRICE</span><span>TIME</span></div>
            <div className="recent-row up-text"><span>{formatPrice(selectedAsset.price * 1.0003, selectedAsset.symbol)}</span><span>12:41:08</span></div>
            <div className="recent-row down-text"><span>{formatPrice(selectedAsset.price * 0.9998, selectedAsset.symbol)}</span><span>12:40:52</span></div>
          </div>
        </aside>
      </div> : activePage === 'Screener'
        ? <ScreenerPage onSelectAsset={(symbol) => { setSelectedSymbol(symbol); setActivePage('Chart') }} />
        : activePage === 'Ideas'
          ? <IdeasPage onSelectAsset={(symbol) => { setSelectedSymbol(symbol); setActivePage('Chart') }} />
          : activePage === 'Leaderboard'
            ? <LeaderboardPage user={user} />
            : null}
      <MarketOverview active={activePage === 'Markets'} />
      <footer className="terminal-footer"><span>Northstar {activePage.toLowerCase()} workspace</span><span>* Screener quotes are examples. Ideas are educational prompts, not investment advice.</span><span className="legal-footer-links"><button type="button" onClick={() => onLegalNavigation('terms')}>Terms</button><button type="button" onClick={() => onLegalNavigation('privacy')}>Privacy</button></span></footer>
      {notice && <div className="terminal-toast" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
    </main>
  )
}

export default Trade