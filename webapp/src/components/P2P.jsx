import { useState } from 'react'
import { BadgeCheck, SlidersHorizontal } from 'lucide-react'
import { getT } from '../i18n'

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

export default function P2P({ lang }) {
  const t = getT(lang)
  const [side, setSide]         = useState('BUY')
  const [currency, setCurrency] = useState('USD')

  const ads = ADS[side]

  return (
    <div className="flex flex-col">

      {/* Buy / Sell tab strip */}
      <div className="flex border-b border-[#2B2F36]">
        {['BUY', 'SELL'].map(s => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={`flex-1 py-2.5 text-sm font-bold relative transition-colors ${
              side === s
                ? s === 'BUY' ? 'text-[#03A66D]' : 'text-[#CF304A]'
                : 'text-[#848E9C]'
            }`}
          >
            {s === 'BUY' ? t('buy') : t('sell')}
            {side === s && (
              <span
                className={`absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-t ${
                  s === 'BUY' ? 'bg-[#03A66D]' : 'bg-[#CF304A]'
                }`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2B2F36]">
        <div className="flex items-center bg-[#1E2026] rounded border border-[#2B2F36] p-0.5 gap-0.5">
          {CURRENCIES.map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                currency === c
                  ? 'bg-[#2B2F36] text-[#EAECEF]'
                  : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1E2026] border border-[#2B2F36] rounded text-[11px] text-[#848E9C] font-medium ml-auto flex-shrink-0 hover:text-[#EAECEF] transition-colors">
          <SlidersHorizontal size={11} />
          {t('filter')}
        </button>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-4 py-1.5 border-b border-[#2B2F36]">
        <span className="flex-1 text-[10px] text-[#848E9C] font-medium uppercase tracking-wider">{t('merchant_methods')}</span>
        <span className="text-[10px] text-[#848E9C] font-medium uppercase tracking-wider">{t('price_limit')}</span>
      </div>

      {/* Ad list */}
      <div>
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="px-4 py-3 border-b border-[#2B2F36]/60 hover:bg-[#1E2026] transition-colors"
          >
            <div className="flex items-start gap-3">

              {/* Left: merchant info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-semibold text-[#EAECEF]">{ad.name}</span>
                  {ad.verified && (
                    <BadgeCheck size={12} className="text-[#F0B90B] flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] text-[#848E9C] tabular-nums">
                    {ad.trades.toLocaleString()} {t('trades_suffix')}
                  </span>
                  <span className="text-[#2B2F36]">·</span>
                  <span className={`text-[11px] font-medium tabular-nums ${
                    ad.completion >= 99 ? 'text-[#03A66D]' : 'text-[#848E9C]'
                  }`}>
                    {ad.completion}%
                  </span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {ad.banks.map(b => (
                    <span key={b} className="text-[10px] px-1.5 py-0.5 bg-[#2B2F36] rounded text-[#848E9C]">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: price + action */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-right">
                  <p className={`text-base font-bold tabular-nums leading-tight ${
                    side === 'BUY' ? 'text-[#03A66D]' : 'text-[#CF304A]'
                  }`}>
                    {ad.price.toFixed(4)}
                  </p>
                  <p className="text-[11px] text-[#848E9C] tabular-nums mt-0.5">
                    {ad.min.toLocaleString()}–{ad.max.toLocaleString()} {currency}
                  </p>
                </div>
                <button
                  className={`px-4 py-1.5 rounded text-xs font-bold transition-all active:scale-95 ${
                    side === 'BUY'
                      ? 'bg-[#03A66D] text-white hover:bg-[#029c65]'
                      : 'bg-[#CF304A] text-white hover:bg-[#c02c43]'
                  }`}
                >
                  {side === 'BUY' ? t('buy') : t('sell')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
