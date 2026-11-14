import { useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import { LogoMark } from '../ui/Logo'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/journal': 'Trade journal',
  '/analytics': 'Analytics',
  '/watchlist': 'Watchlist',
  '/rules': 'Trading rules',
  '/settings': 'Settings',
}

export default function Navbar({ onLogTrade }: { onLogTrade: () => void }) {
  const { pathname } = useLocation()

  return (
    <header
      className="flex items-center justify-between gap-3 px-4 sm:px-8 h-[64px] shrink-0"
      style={{ background: 'color-mix(in srgb, var(--bg) 82%, transparent)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="md:hidden"><LogoMark size={28} /></span>
        <h1 className="text-[20px] font-bold truncate" style={{ color: 'var(--text)' }}>
          {PAGE_TITLES[pathname] ?? 'EdgeLedger'}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button onClick={onLogTrade} className="btn-primary text-[13.5px] !py-2 !px-3.5">
          <Plus size={15} strokeWidth={2.5} />
          <span>Log trade</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-px rounded text-[11px] font-medium mono"
            style={{ background: 'rgba(255,255,255,.2)' }}>N</kbd>
        </button>
      </div>
    </header>
  )
}
