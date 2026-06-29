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
      tg.setHeaderColor('#020617')
      tg.setBackgroundColor('#020617')
    }
  }, [])

  const ActiveComponent = TABS.find(t => t.id === active)?.Component

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden select-none">

      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-800/70 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center">
            <BarChart2 size={13} className="text-blue-400" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">Crypto App</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-slate-500 font-medium">Live</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.13, ease: 'easeOut' }}
          >
            {ActiveComponent && <ActiveComponent />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex border-t border-slate-800/70 bg-slate-950/96 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const on = active === id
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors duration-150"
            >
              <Icon
                size={19}
                strokeWidth={on ? 2 : 1.5}
                className={on ? 'text-blue-400' : 'text-slate-600'}
              />
              <span className={`text-[10px] font-medium tracking-wide transition-colors ${on ? 'text-blue-400' : 'text-slate-600'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
