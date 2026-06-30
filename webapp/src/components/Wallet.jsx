import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, ArrowUp, ArrowLeftRight, Eye, EyeOff, ChevronRight, X } from 'lucide-react'
import { getT } from '../i18n'

const COIN_META = {
  USDT: { name: 'Tether',   color: '#26A17B', icon: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',             tradable: false },
  BTC:  { name: 'Bitcoin',  color: '#F7931A', icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',               tradable: true  },
  ETH:  { name: 'Ethereum', color: '#627EEA', icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',            tradable: true  },
  BNB:  { name: 'BNB',      color: '#F0B90B', icon: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png',   tradable: true  },
  XRP:  { name: 'Ripple',   color: '#0085C0', icon: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', tradable: true  },
  SOL:  { name: 'Solana',   color: '#9945FF', icon: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',             tradable: true  },
  TON:  { name: 'Toncoin',  color: '#0098EA', icon: 'https://cryptologos.cc/logos/toncoin-ton-logo.png',                          tradable: true  },
}

const BINANCE_SYMS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT', 'TONUSDT']
const API_URL      = import.meta.env.VITE_API_URL ?? ''

// ── localStorage demo fallback ────────────────────────────────────────────────
const DEMO_KEY = 'fittex_balances'
const INIT_BAL = { usdt: 10000, btc: 0, eth: 0, bnb: 0, xrp: 0, sol: 0, ton: 0 }

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY)) ?? { ...INIT_BAL } }
  catch { return { ...INIT_BAL } }
}
function saveLocal(b) { localStorage.setItem(DEMO_KEY, JSON.stringify(b)) }

// ── Formatters ─────────────────────────────────────────────────────────────────
function fmt(n, digits = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
function fmtCoin(n) {
  if (n === 0)        return '0.00'
  if (n >= 1)         return fmt(n, 4)
  if (n >= 0.0001)    return n.toFixed(6)
  return n.toFixed(8)
}

// ── AssetIcon ─────────────────────────────────────────────────────────────────
function AssetIcon({ symbol, color, icon }) {
  const [err, setErr] = useState(false)
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ background: `${color}18`, border: `1px solid ${color}28` }}
    >
      {!err && icon ? (
        <img src={icon} alt={symbol} className="w-6 h-6 object-contain" onError={() => setErr(true)} />
      ) : (
        <span className="text-[10px] font-bold" style={{ color }}>{symbol.slice(0, 3)}</span>
      )}
    </div>
  )
}

// ── Trade modal ───────────────────────────────────────────────────────────────
function TradeModal({ coin, prices, balances, userId, t, onClose, onUpdate }) {
  const [side, setSide]       = useState('buy')
  const [amountStr, setAmt]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const price   = prices[coin.symbol + 'USDT'] ?? 0
  const amount  = parseFloat(amountStr) || 0
  const coinQty = price > 0 ? amount / price : 0

  const usdtBal = balances?.usdt  ?? 0
  const coinBal = balances?.[coin.symbol.toLowerCase()] ?? 0
  const maxBuy  = usdtBal
  const maxSell = coinBal * price

  const setPercent = (pct) => {
    const max = side === 'buy' ? maxBuy : maxSell
    setAmt(((max * pct) / 100).toFixed(2))
    setError(null)
  }

  const handleConfirm = async () => {
    if (!amount || !price) return
    setLoading(true)
    setError(null)

    // ── Demo mode: no API → trade locally ──────────────────────────────────
    if (!API_URL || !userId) {
      const newBal  = { ...balances }
      const coinKey = coin.symbol.toLowerCase()
      const qty     = amount / price
      if (side === 'buy') {
        if (newBal.usdt < amount) { setError('insufficient_usdt'); setLoading(false); return }
        newBal.usdt       -= amount
        newBal[coinKey]    = (newBal[coinKey] ?? 0) + qty
      } else {
        if ((newBal[coinKey] ?? 0) < qty) { setError('insufficient_coin'); setLoading(false); return }
        newBal.usdt       += amount
        newBal[coinKey]   -= qty
      }
      saveLocal(newBal)
      onUpdate(newBal)
      setLoading(false)
      onClose()
      return
    }

    // ── API mode: save to bot DB ────────────────────────────────────────────
    try {
      const res  = await fetch(`${API_URL}/api/trade`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ user_id: userId, side, symbol: coin.symbol.toLowerCase(), amount_usdt: amount, price }),
      })
      const data = await res.json()
      if (res.ok) { onUpdate(data); onClose() }
      else          setError(data.error ?? 'network_error')
    } catch {
      setError('network_error')
    } finally {
      setLoading(false)
    }
  }

  const canConfirm = amount > 0 && price > 0 && !loading

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 340 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-[#1E2026] rounded-t-2xl border-t border-[#2B2F36]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2B2F36]">
        <div className="flex items-center gap-2.5">
          <AssetIcon symbol={coin.symbol} color={coin.color} icon={coin.icon} />
          <div>
            <p className="text-sm font-bold text-white leading-tight">{coin.name}</p>
            <p className="text-xs text-[#848E9C] tabular-nums">
              {price > 0 ? `$${fmt(price)}` : '...'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 text-[#848E9C] hover:text-white transition-colors rounded-md hover:bg-[#2B2F36]">
          <X size={16} />
        </button>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Buy / Sell tabs */}
        <div className="flex bg-[#0B0E11] rounded-lg p-0.5">
          {['buy', 'sell'].map(s => (
            <button
              key={s}
              onClick={() => { setSide(s); setAmt(''); setError(null) }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                side === s
                  ? s === 'buy' ? 'bg-[#03A66D] text-white' : 'bg-[#CF304A] text-white'
                  : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              {t(s)} {coin.symbol}
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div>
          <p className="text-[10px] text-[#848E9C] font-medium uppercase tracking-wider mb-1.5">
            {t('amount_usdt')}
          </p>
          <div className="flex items-center bg-[#0B0E11] border border-[#2B2F36] rounded-lg px-3 py-2.5 focus-within:border-[#F0B90B] transition-colors">
            <span className="text-[#848E9C] text-sm mr-2 font-medium">$</span>
            <input
              type="number"
              min="0"
              value={amountStr}
              onChange={e => { setAmt(e.target.value); setError(null) }}
              placeholder="0.00"
              className="flex-1 bg-transparent text-white text-sm font-semibold outline-none tabular-nums placeholder:text-[#848E9C]/40"
            />
          </div>
          <div className="flex gap-1.5 mt-2">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                onClick={() => setPercent(pct)}
                className="flex-1 py-1 text-[11px] font-semibold text-[#848E9C] bg-[#0B0E11] border border-[#2B2F36] rounded hover:border-[#F0B90B] hover:text-[#F0B90B] transition-colors"
              >
                {pct === 100 ? 'MAX' : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#848E9C]">{t('available')}</span>
            <span className="text-white font-medium tabular-nums">
              {side === 'buy'
                ? `$${fmt(usdtBal)} USDT`
                : `${fmtCoin(coinBal)} ${coin.symbol}`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#848E9C]">{side === 'buy' ? t('you_get') : t('you_spend')}</span>
            <span className="font-semibold tabular-nums" style={{ color: coin.color }}>
              {coinQty > 0 ? `${fmtCoin(coinQty)} ${coin.symbol}` : '—'}
            </span>
          </div>
        </div>

        {error && <p className="text-xs text-[#CF304A] text-center">{t(error)}</p>}

        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
            side === 'buy' ? 'bg-[#03A66D] hover:bg-[#029c65]' : 'bg-[#CF304A] hover:bg-[#c02c43]'
          }`}
        >
          {loading ? '...' : t('confirm')}
        </button>
      </div>
    </motion.div>
  )
}

// ── Main Wallet ───────────────────────────────────────────────────────────────
export default function Wallet({ lang, userId }) {
  const t = getT(lang)

  const [hidden,     setHidden]     = useState(false)
  const [balances,   setBalances]   = useState(null)
  const [prices,     setPrices]     = useState({})   // { BTCUSDT: number }
  const [changes,    setChanges]    = useState({})   // { BTCUSDT: number } 24h %
  const [tradeModal, setTradeModal] = useState(null)

  // Load balances: try API first, fall back to localStorage
  useEffect(() => {
    if (API_URL && userId) {
      fetch(`${API_URL}/api/balance?user_id=${userId}`)
        .then(r => r.json())
        .then(data => setBalances(data.error ? loadLocal() : data))
        .catch(() => setBalances(loadLocal()))
    } else {
      setBalances(loadLocal())
    }
  }, [userId])

  // Live prices + 24h change from Binance, polled every 15 s
  useEffect(() => {
    const ctrl = new AbortController()
    const load = async () => {
      try {
        const r = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(BINANCE_SYMS))}`,
          { signal: ctrl.signal }
        )
        const d = await r.json()
        if (!Array.isArray(d)) return
        const p = {}, c = {}
        d.forEach(x => {
          p[x.symbol] = parseFloat(x.lastPrice)
          c[x.symbol] = parseFloat(x.priceChangePercent)
        })
        setPrices(p)
        setChanges(c)
      } catch {}
    }
    load()
    const timer = setInterval(load, 15_000)
    return () => { ctrl.abort(); clearInterval(timer) }
  }, [])

  const assets = Object.entries(COIN_META).map(([sym, meta]) => {
    const bal    = balances ? (balances[sym.toLowerCase()] ?? 0) : 0
    const price  = sym === 'USDT' ? 1 : (prices[sym + 'USDT']  ?? 0)
    const change = sym === 'USDT' ? 0 : (changes[sym + 'USDT'] ?? 0)
    return { symbol: sym, ...meta, balance: bal, price, change, usd: bal * price }
  })

  const total = assets.reduce((s, a) => s + a.usd, 0)

  const ACTIONS = [
    { label: t('deposit'),  Icon: ArrowDown      },
    { label: t('withdraw'), Icon: ArrowUp        },
    { label: t('transfer'), Icon: ArrowLeftRight },
  ]

  return (
    <div className="px-4 pt-4">

      {/* Balance card */}
      <div className="bg-[#1E2026] border border-[#2B2F36] rounded-xl px-4 py-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#848E9C] font-medium uppercase tracking-widest">
            {t('total_balance')}
          </span>
          <button
            onClick={() => setHidden(h => !h)}
            className="text-[#848E9C] hover:text-[#EAECEF] transition-colors"
          >
            {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        <div className="text-[28px] font-bold text-[#EAECEF] tracking-tight leading-none">
          {hidden ? '••••••' : balances ? `$${fmt(total)}` : (
            <span className="text-zinc-600 animate-pulse text-xl">загрузка...</span>
          )}
        </div>

        <p className="text-[10px] text-[#848E9C] mt-2">{t('demo_notice')}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {ACTIONS.map(({ label, Icon }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-1.5 py-3 bg-[#1E2026] border border-[#2B2F36] rounded-xl hover:bg-[#2B2F36] active:bg-[#2B2F36] transition-colors"
          >
            <Icon size={16} className="text-[#EAECEF]" />
            <span className="text-[11px] text-[#848E9C] font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Assets header */}
      <div className="flex items-center justify-between py-2 border-b border-[#2B2F36]">
        <span className="text-[10px] text-[#848E9C] font-medium uppercase tracking-widest">{t('my_assets')}</span>
        <button className="flex items-center gap-0.5 text-[11px] text-[#848E9C] hover:text-[#EAECEF] transition-colors">
          {t('all')} <ChevronRight size={11} />
        </button>
      </div>

      {/* Asset rows */}
      <div className="pb-4">
        {assets.map((asset) => {
          const isPos = asset.change >= 0
          return (
            <div
              key={asset.symbol}
              className="flex items-center gap-3 py-2.5 border-b border-[#2B2F36]/60 -mx-4 px-4"
            >
              <AssetIcon symbol={asset.symbol} color={asset.color} icon={asset.icon} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#EAECEF] leading-tight">{asset.symbol}</p>
                <p className="text-[11px] text-[#848E9C] mt-0.5">{asset.name}</p>
              </div>

              {/* 24h price change */}
              {asset.symbol !== 'USDT' && (
                <span className={`text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-sm flex-shrink-0 ${
                  isPos ? 'bg-[#03A66D]/10 text-[#03A66D]' : 'bg-[#CF304A]/10 text-[#CF304A]'
                }`}>
                  {isPos ? '+' : ''}{asset.change.toFixed(2)}%
                </span>
              )}

              {asset.tradable && (
                <button
                  onClick={() => setTradeModal(asset)}
                  className="px-2.5 py-1 text-[11px] font-semibold border border-[#F0B90B]/40 text-[#F0B90B] rounded hover:bg-[#F0B90B]/10 transition-colors flex-shrink-0"
                >
                  {t('trade')}
                </button>
              )}

              <div className="text-right">
                <p className="text-sm font-semibold text-[#EAECEF] tabular-nums leading-tight">
                  {hidden ? '•••' : fmtCoin(asset.balance)}
                </p>
                <p className="text-[11px] text-[#848E9C] tabular-nums mt-0.5">
                  {hidden ? '•••' : `$${fmt(asset.usd)}`}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Trade modal with backdrop */}
      <AnimatePresence>
        {tradeModal && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setTradeModal(null)}
            />
            <TradeModal
              key="modal"
              coin={tradeModal}
              prices={prices}
              balances={balances}
              userId={userId}
              t={t}
              onClose={() => setTradeModal(null)}
              onUpdate={setBalances}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
