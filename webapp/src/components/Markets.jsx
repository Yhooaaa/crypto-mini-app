import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X, WifiOff } from 'lucide-react'

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'TONUSDT', 'BNBUSDT', 'XRPUSDT']

const COIN_META = {
  BTCUSDT: {
    name: 'Bitcoin',
    abbr: 'BTC',
    icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  },
  ETHUSDT: {
    name: 'Ethereum',
    abbr: 'ETH',
    icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  SOLUSDT: {
    name: 'Solana',
    abbr: 'SOL',
    icon: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  },
  TONUSDT: {
    name: 'Toncoin',
    abbr: 'TON',
    icon: 'https://cdn.jsdelivr.net/gh/atomicwallet/crypto-assets@master/assets/logos/ton-ton.png',
  },
  BNBUSDT: {
    name: 'BNB',
    abbr: 'BNB',
    icon: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png',
  },
  XRPUSDT: {
    name: 'Ripple',
    abbr: 'XRP',
    icon: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
  },
}

function formatPrice(price) {
  const n = parseFloat(price)
  if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (n >= 1)    return `$${n.toFixed(3)}`
  return `$${n.toFixed(5)}`
}

function formatVolume(quoteVolume) {
  const v = parseFloat(quoteVolume)
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`
  if (v >= 1_000_000)     return `$${(v / 1_000_000).toFixed(1)}M`
  return `$${(v / 1000).toFixed(0)}K`
}

function CoinIcon({ abbr, icon }) {
  const [err, setErr] = useState(false)
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-zinc-800">
      {!err && icon ? (
        <img
          src={icon}
          alt={abbr}
          className="w-6 h-6 object-contain"
          onError={() => setErr(true)}
        />
      ) : (
        <span className="text-[9px] font-bold text-zinc-400 tracking-tight">{abbr.slice(0, 3)}</span>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <div>
      <div className="flex items-center px-4 py-1.5 border-b border-zinc-800">
        <span className="flex-1 text-[10px] text-zinc-600 font-medium uppercase tracking-wider">Монета</span>
        <span className="w-24 text-right text-[10px] text-zinc-600 font-medium uppercase tracking-wider">Цена</span>
        <span className="w-[72px] text-right text-[10px] text-zinc-600 font-medium uppercase tracking-wider">24H%</span>
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 px-4 py-2 border-b border-zinc-800/50">
          <div className="w-7 h-7 rounded-full bg-zinc-800/80 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-14 bg-zinc-800/80 rounded-sm animate-pulse" />
            <div className="h-2 w-10 bg-zinc-800/50 rounded-sm animate-pulse" />
          </div>
          <div className="w-24 flex justify-end">
            <div className="h-2.5 w-16 bg-zinc-800/80 rounded-sm animate-pulse" />
          </div>
          <div className="w-[72px] flex justify-end">
            <div className="h-2.5 w-11 bg-zinc-800/80 rounded-sm animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 pt-16 text-center">
      <WifiOff size={20} className="text-zinc-600" />
      <p className="text-sm text-zinc-500">Нет соединения с сервером</p>
      <button
        onClick={onRetry}
        className="mt-1 px-4 py-1.5 rounded-md border border-zinc-700 text-sm text-zinc-300 bg-zinc-900 hover:bg-zinc-800 transition-colors"
      >
        Повторить
      </button>
    </div>
  )
}

export default function Markets() {
  const [coins, setCoins]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [selected, setSelected] = useState(null)
  const refreshRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    const fetchPrices = async (silent = false) => {
      if (signal.aborted) return
      silent ? setSpinning(true) : setLoading(true)
      setError(false)
      try {
        const res  = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(SYMBOLS))}`,
          { signal }
        )
        const data = await res.json()
        if (!signal.aborted && Array.isArray(data)) {
          setCoins(data)
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        if (!signal.aborted) setError(true)
      } finally {
        if (!signal.aborted) {
          setLoading(false)
          setSpinning(false)
        }
      }
    }

    refreshRef.current = () => fetchPrices(true)

    fetchPrices()
    const timer = setInterval(() => fetchPrices(true), 15_000)

    return () => {
      controller.abort()
      clearInterval(timer)
      refreshRef.current = null
    }
  }, [])

  if (loading) return <Skeleton />
  if (error)   return <ErrorState onRetry={() => refreshRef.current?.()} />

  return (
    <>
      {/* Column header */}
      <div className="flex items-center px-4 py-1.5 border-b border-zinc-800 bg-[#0B0E11] sticky top-0 z-10">
        <span className="flex-1 text-[10px] text-zinc-600 font-medium uppercase tracking-wider">Монета</span>
        <span className="w-24 text-right text-[10px] text-zinc-600 font-medium uppercase tracking-wider">Цена</span>
        <div className="w-[72px] flex items-center justify-end gap-1.5">
          <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">24H%</span>
          <button
            onClick={() => refreshRef.current?.()}
            className="text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            <RefreshCw size={10} className={spinning ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Coin rows */}
      <div>
        {coins.map((coin) => {
          const meta   = COIN_META[coin.symbol]
          if (!meta) return null
          const change = parseFloat(coin.priceChangePercent)
          const isPos  = change >= 0

          return (
            <button
              key={coin.symbol}
              onClick={() => setSelected(coin)}
              className="w-full flex items-center gap-2.5 px-4 py-2 border-b border-zinc-800/60 hover:bg-zinc-900 active:bg-zinc-800/80 transition-colors text-left"
            >
              <CoinIcon abbr={meta.abbr} icon={meta.icon} />

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white leading-tight">
                  {meta.abbr}
                  <span className="text-zinc-500 font-normal text-[12px]">/USDT</span>
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-none">
                  Vol {formatVolume(coin.quoteVolume)}
                </p>
              </div>

              <div className="w-24 text-right">
                <p className="text-[13px] font-semibold text-white tabular-nums leading-tight">
                  {formatPrice(coin.lastPrice)}
                </p>
                <p className="text-[11px] text-zinc-600 tabular-nums mt-0.5 leading-none">
                  {formatPrice(coin.prevClosePrice)}
                </p>
              </div>

              <div className="w-[72px] text-right">
                <span
                  className={`inline-block text-[12px] font-semibold tabular-nums px-1.5 py-0.5 rounded-sm ${
                    isPos
                      ? 'bg-[#03A66D]/10 text-[#03A66D]'
                      : 'bg-[#CF304A]/10 text-[#CF304A]'
                  }`}
                >
                  {isPos ? '↗' : '↘'} {isPos ? '+' : ''}{change.toFixed(2)}%
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Chart overlay */}
      <AnimatePresence>
        {selected && (() => {
          const meta   = COIN_META[selected.symbol]
          const change = parseFloat(selected.priceChangePercent)
          const isPos  = change >= 0
          return (
            <motion.div
              key="chart"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 340 }}
              className="fixed inset-0 z-50 flex flex-col bg-[#0B0E11]"
            >
              {/* Chart header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <CoinIcon abbr={meta?.abbr ?? '?'} icon={meta?.icon ?? ''} />
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">
                      {meta?.abbr ?? selected.symbol}
                      <span className="text-zinc-500 font-normal"> / USDT</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-white tabular-nums">
                        {formatPrice(selected.lastPrice)}
                      </span>
                      <span className={`text-xs font-semibold tabular-nums ${isPos ? 'text-[#03A66D]' : 'text-[#CF304A]'}`}>
                        {isPos ? '↗' : '↘'} {isPos ? '+' : ''}{change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 text-zinc-500 hover:text-white transition-colors rounded-md hover:bg-zinc-800"
                >
                  <X size={16} />
                </button>
              </div>

              <iframe
                src={`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(`BINANCE:${selected.symbol}`)}&interval=D&theme=dark&style=1&locale=ru&hide_top_toolbar=0&save_image=0`}
                className="flex-1 w-full border-0 bg-[#0B0E11]"
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
