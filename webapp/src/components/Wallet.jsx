import { useState } from 'react'
import { ArrowDown, ArrowUp, ArrowLeftRight, Eye, EyeOff, ChevronRight } from 'lucide-react'

const ASSETS = [
  { symbol: 'USDT', name: 'Tether',   balance: 850.00,   usd: 850.00,  color: '#26A17B', change: +0.01, icon: 'https://assets.coingecko.com/coins/images/325/large/Tether.png' },
  { symbol: 'BTC',  name: 'Bitcoin',  balance: 0.004213, usd: 285.50,  color: '#F7931A', change: +2.34, icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { symbol: 'TON',  name: 'Toncoin',  balance: 45.32,    usd: 110.00,  color: '#0098EA', change: -1.12, icon: 'https://assets.coingecko.com/coins/images/17980/large/ton_token.png' },
  { symbol: 'ETH',  name: 'Ethereum', balance: 0.01840,  usd: 58.20,   color: '#627EEA', change: +1.08, icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
]

const TOTAL = ASSETS.reduce((s, a) => s + a.usd, 0)

const ACTIONS = [
  { label: 'Ввод',    Icon: ArrowDown      },
  { label: 'Вывод',   Icon: ArrowUp        },
  { label: 'Перевод', Icon: ArrowLeftRight  },
]

function AssetIcon({ symbol, color, icon }) {
  const [err, setErr] = useState(false)
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ background: `${color}18`, border: `1px solid ${color}28` }}
    >
      {!err && icon ? (
        <img
          src={icon}
          alt={symbol}
          className="w-6 h-6 object-contain"
          onError={() => setErr(true)}
        />
      ) : (
        <span className="text-[10px] font-bold" style={{ color }}>{symbol.slice(0, 3)}</span>
      )}
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
      <div className="bg-[#1E2026] border border-[#2B2F36] rounded-xl px-4 py-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#848E9C] font-medium uppercase tracking-widest">
            Общий баланс
          </span>
          <button
            onClick={() => setHidden(h => !h)}
            className="text-[#848E9C] hover:text-[#EAECEF] transition-colors"
          >
            {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        <div className="text-[28px] font-bold text-[#EAECEF] tracking-tight leading-none">
          {hidden ? '••••••' : `$${fmt(TOTAL)}`}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-xs text-[#03A66D] font-medium tabular-nums">+$12.40 (+3.2%)</span>
          <span className="text-[11px] text-[#848E9C]">за 24ч</span>
        </div>
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
      <div className="flex items-center justify-between py-2 border-b border-[#2B2F36] mb-0">
        <span className="text-[10px] text-[#848E9C] font-medium uppercase tracking-widest">Мои активы</span>
        <button className="flex items-center gap-0.5 text-[11px] text-[#848E9C] hover:text-[#EAECEF] transition-colors">
          Все <ChevronRight size={11} />
        </button>
      </div>

      {/* Asset rows */}
      <div className="pb-4">
        {ASSETS.map((asset) => {
          const pos    = asset.change >= 0
          const balStr = asset.balance >= 0.01
            ? fmt(asset.balance, 4)
            : asset.balance.toFixed(6)

          return (
            <div
              key={asset.symbol}
              className="flex items-center gap-3 py-2.5 border-b border-[#2B2F36]/60 hover:bg-[#1E2026] active:bg-[#2B2F36] transition-colors cursor-pointer -mx-4 px-4"
            >
              <AssetIcon symbol={asset.symbol} color={asset.color} icon={asset.icon} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#EAECEF] leading-tight">{asset.symbol}</p>
                <p className="text-[11px] text-[#848E9C] mt-0.5">{asset.name}</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-[#EAECEF] tabular-nums leading-tight">
                  {hidden ? '•••' : balStr}
                </p>
                <div className="flex items-center justify-end gap-2 mt-0.5">
                  <span className="text-[11px] text-[#848E9C] tabular-nums">
                    {hidden ? '•••' : `$${fmt(asset.usd)}`}
                  </span>
                  <span className={`text-[11px] font-semibold tabular-nums ${pos ? 'text-[#03A66D]' : 'text-[#CF304A]'}`}>
                    {pos ? '+' : ''}{asset.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
