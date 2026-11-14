import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, BookOpen, BarChart3, Bookmark, ShieldCheck, Settings, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { logoutApi } from '../../api/auth'
import { LogoMark } from '../ui/Logo'
import toast from 'react-hot-toast'

export const NAV_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', group: 'Overview' },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics', group: 'Overview' },
  { to: '/journal',   icon: BookOpen,        label: 'Journal',   group: 'Trading' },
  { to: '/watchlist', icon: Bookmark,        label: 'Watchlist', group: 'Trading' },
  { to: '/rules',     icon: ShieldCheck,     label: 'Rules',     group: 'Trading' },
  { to: '/settings',  icon: Settings,        label: 'Settings',  group: 'Account' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await logoutApi() } catch {}
    logout()
    navigate('/')
    toast.success('Logged out')
  }

  const groups = Array.from(new Set(NAV_LINKS.map((l) => l.group)))

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 244 }}
      transition={{ duration: 0.2, ease: [0.3, 0.7, 0.2, 1] }}
      className="relative hidden md:flex flex-col h-screen shrink-0 overflow-hidden"
      style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3 px-[18px] h-[64px] shrink-0">
        <NavLink to="/" aria-label="EdgeLedger home" className="shrink-0"><LogoMark size={32} /></NavLink>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
              className="font-display text-[18px] font-bold tracking-tight whitespace-nowrap" style={{ color: 'var(--text)' }}>
              EdgeLedger
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pt-2 pb-3">
        {groups.map((g) => (
          <div key={g} className="mb-4">
            {!collapsed ? (
              <p className="px-3 mb-1.5 text-[12px] font-medium" style={{ color: 'var(--text3)' }}>{g}</p>
            ) : (
              <div className="mx-3 mb-2 h-px" style={{ background: 'var(--border)' }} />
            )}
            <div className="space-y-0.5">
              {NAV_LINKS.filter((l) => l.group === g).map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} title={collapsed ? label : undefined}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-colors"
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--brand-bg)' : 'transparent',
                    color: isActive ? 'var(--brand)' : 'var(--text2)',
                    fontWeight: isActive ? 600 : 500,
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <motion.span layoutId="nav-pill" className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full" style={{ background: 'var(--brand)' }} />}
                      <Icon size={17} className="shrink-0" />
                      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-3 pt-3 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
            style={{ background: 'var(--brand)', color: 'var(--card)' }}>
            {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>{user?.fullName}</p>
              <p className="text-[12px] truncate" style={{ color: 'var(--text3)' }}>@{user?.username}</p>
            </div>
          )}
        </div>
        <button onClick={handleLogout} title={collapsed ? 'Log out' : undefined}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors hover:bg-[var(--loss-bg)]"
          style={{ color: 'var(--loss)' }}>
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors hover:bg-[var(--bg2)]"
          style={{ color: 'var(--text3)' }}>
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  )
}
