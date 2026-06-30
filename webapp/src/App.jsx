import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChart2, ArrowLeftRight, Wallet } from 'lucide-react'
import Markets from './components/Markets'
import P2P from './components/P2P'
import WalletTab from './components/Wallet'

const TABS = [
  { id: 'markets', label: 'Рынки',    Icon: BarChart2,       Component: Markets   },
  { id: 'p2p',     label: 'P2P',      Icon: ArrowLeftRight,  Component: P2P       },
  { id: 'wallet',  label: 'Кошелёк',  Icon: Wallet,          Component: WalletTab },
]

export default function App() {
  const [active, setActive] = useState('markets')

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      tg.setHeaderColor('#0B0E11')
      tg.setBackgroundColor('#0B0E11')
    }
  }, [])

  const ActiveComponent = TABS.find(t => t.id === active)?.Component

  return (
    <div className="flex flex-col h-screen bg-[#0B0E11] text-[#EAECEF] overflow-hidden select-none">

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <BarChart2 size={14} className="text-[#F0B90B]" strokeWidth={2} />
          <span className="text-[13px] font-bold tracking-wide text-white">CryptoApp</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#03A66D]" />
          <span className="text-[11px] text-zinc-500 font-medium">Live</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[52px] scrollbar-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
          >
            {ActiveComponent && <ActiveComponent />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav — flat, 1px top border, active indicator as top stripe */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex border-t border-zinc-800 bg-[#0B0E11]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const on = active === id
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-colors duration-100"
            >
              {/* Active top indicator stripe */}
              {on && (
                <span className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-[#F0B90B] rounded-b-sm" />
              )}
              <Icon
                size={17}
                strokeWidth={on ? 2.2 : 1.6}
                className={on ? 'text-[#F0B90B]' : 'text-zinc-600'}
              />
              <span className={`text-[10px] font-medium ${on ? 'text-[#F0B90B]' : 'text-zinc-600'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
