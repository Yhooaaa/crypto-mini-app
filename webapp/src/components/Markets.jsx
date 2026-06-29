import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X, TrendingUp, TrendingDown } from 'lucide-react'

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'TONUSDT', 'BNBUSDT', 'XRPUSDT']

const COIN_META = {
  BTCUSDT: { name: 'Bitcoin',   abbr: 'BTC', color: '#F7931A' },
  ETHUSDT: { name: 'Ethereum',  abbr: 'ETH', color: '#627EEA' },
  SOLUSDT: { name: 'Solana',    abbr: 'SOL', color: '#9945FF' },
  TONUSDT: { name: 'Toncoin',   abbr: 'TON', color: '#0098EA' },
  BNBUSDT: { name: 'BNB',       abbr: 'BNB', color: '#F0B90B' },
  XRPUSDT: { name: 'Ripple',    abbr: 'XRP', color: '#346AA9' },
}

function formatPrice(price) {
  const n = parseFloat(price)
  if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (n >= 1)    return `$${n.toFixed(3)}`
  return `$${n.toFixed(5)}`
}

function CoinIcon({ abbr, color }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
      style={{ background: `${color}1a`, border: `1.5px solid ${color}35` }}
    >
      <span style={{ color }}>{abbr}</span>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-1 px-4 pt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[60px] rounded-xl bg-slate-800/40 animate-pulse" />
      ))}
    </div>
  )
}

export default function Markets() {
  const [coins, setCoins]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [spinning, setSpinning] = useState(false)
  const [selected, setSelected] = useState(null)

  const fetchPrices = useCallback(async (silent = false) => {
    if (silent) setSpinning(true)
    else setLoading(true)
    try {
      const res  = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(SYMBOLS))}`
      )
      const data = await res.json()
      if (Array.isArray(data)) setCoins(data)
    } catch { /* keep stale */ } finally {
      setLoading(false)
      setSpinning(false)
    }
  }, [])

  useEffect(() => {
    fetchPrices()
    const id = setInterval(() => fetchPrices(true), 15_000)
    return () => clearInterval(id)
  }, [fetchPrices])

  if (loading) return <Skeleton />

  return (
    <>
      <div className="px-4 pt-4">
        {/* Row header */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Монета</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Цена</span>
            <button
              onClick={() => fetchPrices(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 transition-colors"
            >
              <RefreshCw size={12} className={spinning ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Coin rows */}
        <div className="space-y-0.5">
          {coins.map((coin, i) => {
            const meta   = COIN_META[coin.symbol]
            if (!meta) return null
            const change = parseFloat(coin.priceChangePercent)
            const isPos  = change >= 0

            return (
              <motion.button
                key={coin.symbol}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.045, duration: 0.2 }}
                onClick={() => setSelected(coin)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800/60 active:bg-slate-800/80 transition-colors text-left"
              >
                <CoinIcon abbr={meta.abbr} color={meta.color} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">{meta.abbr}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{meta.name}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-white tabular-nums leading-tight">
                    {formatPrice(coin.lastPrice)}
                  </p>
                  <span
                    className={`inline-flex items-center gap-0.5 mt-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                      isPos
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {isPos ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {isPos ? '+' : ''}{change.toFixed(2)}%
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Chart fullscreen overlay */}
      <AnimatePresence>
        {selected && (() => {
          const meta   = COIN_META[selected.symbol]
          const change = parseFloat(selected.priceChangePercent)
          const isPos  = change >= 0
          return (
            <motion.div
              key="chart"
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed inset-0 z-50 flex flex-col bg-slate-950"
            >
              {/* Chart header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/70 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <CoinIcon abbr={meta?.abbr ?? '?'} color={meta?.color ?? '#888'} />
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">
                      {meta?.abbr ?? selected.symbol} / USDT
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-white tabular-nums">
                        {formatPrice(selected.lastPrice)}
                      </span>
                      <span className={`text-[11px] font-semibold tabular-nums ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPos ? '+' : ''}{change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
                >
                  <X size={17} />
                </button>
              </div>

              {/* TradingView iframe */}
              <iframe
                src={`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(`BINANCE:${selected.symbol}`)}&interval=D&theme=dark&style=1&locale=ru&hide_top_toolbar=0&save_image=0`}
                className="flex-1 w-full border-0 bg-slate-950"
                title={`${selected.symbol} chart`}
                allow="fullscreen"
              />
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </>
  )
}
