import { useState } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, ChevronDown, SlidersHorizontal } from 'lucide-react'

const CURRENCIES = ['USD', 'EUR', 'UAH', 'RUB']

const ADS = {
  BUY: [
    {
      id: 1, name: 'CryptoKing88', verified: true,  trades: 1247, completion: 99.1,
      price: 1.0020, available: '50 000', min: 100,   max: 10000,
      banks: ['Wise', 'SEPA'],
    },
    {
      id: 2, name: 'USDTmaster',   verified: true,  trades: 892,  completion: 98.4,
      price: 1.0015, available: '25 000', min: 50,    max: 5000,
      banks: ['Revolut', 'Wise'],
    },
    {
      id: 3, name: 'FastTrader',   verified: false, trades: 456,  completion: 97.2,
      price: 1.0008, available: '12 000', min: 200,   max: 8000,
      banks: ['SEPA'],
    },
    {
      id: 4, name: 'TetherPro',    verified: true,  trades: 2103, completion: 99.7,
      price: 0.9995, available: '80 000', min: 500,   max: 20000,
      banks: ['Wise', 'Revolut', 'SEPA'],
    },
    {
      id: 5, name: 'GlobalSwap',   verified: true,  trades: 678,  completion: 98.0,
      price: 0.9988, available: '18 000', min: 100,   max: 7500,
      banks: ['Revolut'],
    },
  ],
  SELL: [
    {
      id: 6, name: 'AlphaTrade',   verified: true,  trades: 743,  completion: 98.9,
      price: 1.0030, available: '30 000', min: 100,   max: 15000,
      banks: ['Wise'],
    },
    {
      id: 7, name: 'SafeExchange', verified: true,  trades: 1567, completion: 99.3,
      price: 1.0022, available: '45 000', min: 250,   max: 12000,
      banks: ['SEPA', 'Revolut'],
    },
    {
      id: 8, name: 'QuickSwap',    verified: false, trades: 312,  completion: 96.8,
      price: 1.0011, available: '8 000',  min: 50,    max: 3000,
      banks: ['Wise'],
    },
    {
      id: 9, name: 'SecurePay',    verified: true,  trades: 2890, completion: 99.5,
      price: 1.0005, available: '100 000', min: 1000, max: 50000,
      banks: ['SEPA', 'Wise', 'Revolut'],
    },
  ],
}

export default function P2P() {
  const [side, setSide]         = useState('BUY')
  const [currency, setCurrency] = useState('USD')

  const ads = ADS[side]

  return (
    <div className="flex flex-col">

      {/* Buy / Sell toggle */}
      <div className="flex mx-4 mt-4 p-1 bg-slate-800/50 rounded-xl gap-1">
        {['BUY', 'SELL'].map(s => (
          <motion.button
            key={s}
            onClick={() => setSide(s)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all relative overflow-hidden ${
              side === s ? '' : 'text-slate-500'
            }`}
            style={{ zIndex: 1 }}
          >
            {side === s && (
              <motion.span
                layoutId="sideBg"
                className={`absolute inset-0 rounded-lg ${s === 'BUY' ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}
                style={{ zIndex: -1 }}
              />
            )}
            <span className={
              side === s
                ? s === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                : 'text-slate-500'
            }>
              {s === 'BUY' ? 'Купить' : 'Продать'}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 mt-3 pb-0.5">
        <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg">
          {CURRENCIES.map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                currency === c
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/50 rounded-lg text-[11px] text-slate-400 font-medium ml-auto flex-shrink-0">
          <SlidersHorizontal size={11} />
          Фильтр
        </button>
      </div>

      {/* Column labels */}
      <div className="flex items-center px-4 mt-3 mb-1">
        <span className="flex-1 text-[10px] text-slate-600 uppercase tracking-widest font-medium">Мерчант</span>
        <span className="text-[10px] text-slate-600 uppercase tracking-widest font-medium text-right mr-2">Цена</span>
      </div>

      {/* Ad list */}
      <div className="px-4 space-y-2 pb-4">
        {ads.map((ad, i) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.045, duration: 0.2 }}
            className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5"
          >
            <div className="flex items-start gap-2">

              {/* Left: merchant info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-semibold text-white">{ad.name}</span>
                  {ad.verified && (
                    <BadgeCheck size={13} className="text-blue-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] text-slate-500 tabular-nums">{ad.trades.toLocaleString()} сделок</span>
                  <span className="text-slate-700">·</span>
                  <span className={`text-[11px] font-medium tabular-nums ${
                    ad.completion >= 99 ? 'text-emerald-400' : 'text-slate-400'
                  }`}>{ad.completion}%</span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {ad.banks.map(b => (
                    <span key={b} className="text-[10px] px-1.5 py-0.5 bg-slate-800 border border-slate-700/50 rounded text-slate-400">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: price + action */}
              <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
                <div className="text-right">
                  <p className="text-base font-bold text-white tabular-nums leading-tight">
                    {ad.price.toFixed(4)}
                  </p>
                  <p className="text-[11px] text-slate-500 tabular-nums mt-0.5">
                    {currency}
                  </p>
                </div>
                <div className="text-right mb-0.5">
                  <p className="text-[11px] text-slate-500 tabular-nums">
                    {ad.min.toLocaleString()}–{ad.max.toLocaleString()} {currency}
                  </p>
                  <p className="text-[11px] text-slate-600 tabular-nums">
                    Доступно: {ad.available} USDT
                  </p>
                </div>
                <button
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                    side === 'BUY'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25'
                      : 'bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25'
                  }`}
                >
                  {side === 'BUY' ? 'Купить' : 'Продать'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
