import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, BarChart3, Bookmark,
  Shield, Settings, LogOut, ChevronLeft, TrendingUp
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { logoutApi } from '../../api/auth'
import toast from 'react-hot-toast'

const LINKS = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/journal',    icon: BookOpen,         label: 'Journal'    },
  { to: '/analytics',  icon: BarChart3,        label: 'Analytics'  },
  { to: '/watchlist',  icon: Bookmark,         label: 'Watchlist'  },
  { to: '/rules',      icon: Shield,           label: 'Rules'      },
  { to: '/settings',   icon: Settings,         label: 'Settings'   },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await logoutApi() } catch {}
    logout()
    navigate('/login')
    toast.success('Logged out')
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 224 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen shrink-0 overflow-hidden"
      style={{
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-[60px] shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--brand-bg)' }}>
          <TrendingUp size={16} style={{ color: 'var(--brand)' }} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="font-display font-800 text-[15px] tracking-tight whitespace-nowrap"
              style={{ color: 'var(--text)', fontWeight: 800 }}
            >
              EdgeLedger
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                isActive
                  ? 'font-semibold'
                  : 'hover:opacity-80'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--brand-bg)' : 'transparent',
              color: isActive ? 'var(--brand)' : 'var(--text2)',
            })}
          >
            <Icon size={16} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-2 pb-3 space-y-0.5" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div className="flex items-center gap-3 px-3 py-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}
          >
            {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="min-w-0"
              >
                <p className="text-[12.5px] font-semibold truncate" style={{ color: 'var(--text)' }}>{user?.fullName}</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--text3)' }}>@{user?.username}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors hover:opacity-70"
          style={{ color: 'var(--loss)' }}
        >
          <LogOut size={15} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[70px] w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-110"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text2)' }}
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronLeft size={13} />
        </motion.div>
      </button>
    </motion.aside>
  )
}
