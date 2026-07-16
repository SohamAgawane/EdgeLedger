import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import { useAuthStore } from '../../store/authStore'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/journal': 'Trade Journal',
  '/analytics': 'Analytics',
  '/watchlist': 'Watchlist',
  '/rules': 'Trading Rules',
  '/settings': 'Settings',
}

export default function Navbar({ onLogTrade }: { onLogTrade: () => void }) {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
        ? "Good Afternoon"
        : "Good Evening";

  return (
    <header
      className="flex items-center justify-between px-6 h-[60px] shrink-0"
      style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
    >
      <div>
        <h1
          className="text-[16px] font-bold"
          style={{ color: "var(--text)" }}
        >
          {greeting}, {user?.fullName?.split(" ")[0] ?? "Trader"} 👋
        </h1>

        <p
          className="text-[11.5px]"
          style={{ color: "var(--text3)" }}
        >
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
          style={{ background: 'var(--bg2)', color: 'var(--text2)' }}
        >
          <Bell size={15} />
        </button>
        <button
          onClick={onLogTrade}
          className="btn-primary text-[13px] py-2 px-4"
        >
          + Log Trade
        </button>
      </div>
    </header>
  )
}
