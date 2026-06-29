import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ArrowLeftRight, Eye, EyeOff, ChevronRight } from 'lucide-react'

const ASSETS = [
  { symbol: 'USDT', name: 'Tether',   balance: 850.00,   usd: 850.00,  color: '#26A17B', change: +0.01 },
  { symbol: 'BTC',  name: 'Bitcoin',  balance: 0.004213, usd: 285.50,  color: '#F7931A', change: +2.34 },
  { symbol: 'TON',  name: 'Toncoin',  balance: 45.32,    usd: 110.00,  color: '#0098EA', change: -1.12 },
  { symbol: 'ETH',  name: 'Ethereum', balance: 0.01840,  usd: 58.20,   color: '#627EEA', change: +1.08 },
]

const TOTAL = ASSETS.reduce((s, a) => s + a.usd, 0)

const ACTIONS = [
  { label: 'Ввод',    Icon: ArrowDown,       cls: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/15' },
  { label: 'Вывод',   Icon: ArrowUp,         cls: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/15'         },
  { label: 'Перевод', Icon: ArrowLeftRight,  cls: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/15'       },
]

function AssetIcon({ symbol, color }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
      style={{ background: `${color}1a`, border: `1.5px solid ${color}30` }}
    >
      <span style={{ color }}>{symbol.slice(0, 3)}</span>
    </div>
  )
}

function fmt(n, digits = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export default function Wallet() {
  const [hidden, setHidden] = useState(false)

  return (
    <div className="px-4 pt-4">

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 border border-slate-800/80 rounded-2xl px-5 py-5 mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            Общий баланс
          </span>
          <button
            onClick={() => setHidden(h => !h)}
            className="text-slate-600 hover:text-slate-400 transition-colors p-1"
          >
            {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-[32px] font-bold text-white tracking-tight leading-none">
            {hidden ? '••••••' : `$${fmt(TOTAL)}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs text-emerald-400 font-medium tabular-nums">+$12.40 (3.2%)</span>
          <span className="text-[11px] text-slate-600">за 24ч</span>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="flex justify-around mb-5">
        {ACTIONS.map(({ label, Icon, cls, bg }, i) => (
          <motion.button
            key={label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${bg}`}>
              <Icon size={17} className={cls} />
            </div>
            <span className="text-[11px] text-slate-400 font-medium">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Мои активы</span>
        <button className="flex items-center gap-0.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
          Все <ChevronRight size={11} />
        </button>
      </div>

      {/* Asset rows */}
      <div className="space-y-0.5 pb-4">
        {ASSETS.map((asset, i) => {
          const pos = asset.change >= 0
          const balStr = asset.balance >= 0.01
            ? fmt(asset.balance, 4)
            : asset.balance.toFixed(6)

          return (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.06 }}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800/50 active:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <AssetIcon symbol={asset.symbol} color={asset.color} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">{asset.symbol}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{asset.name}</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-white tabular-nums leading-tight">
                  {hidden ? '•••' : balStr}
                </p>
                <div className="flex items-center justify-end gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-500 tabular-nums">
                    {hidden ? '•••' : `$${fmt(asset.usd)}`}
                  </span>
                  <span className={`text-[10px] font-semibold tabular-nums ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pos ? '+' : ''}{asset.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
