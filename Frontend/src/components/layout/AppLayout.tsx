import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar, { NAV_LINKS } from './Sidebar'
import Navbar from './Navbar'
import TradeDrawer from '../trade/TradeDrawer'

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editId, setEditId] = useState<string | undefined>()
  const { pathname } = useLocation()

  const openEditDrawer = (id: string) => { setEditId(id); setDrawerOpen(true) }
  const openCreate = () => { setEditId(undefined); setDrawerOpen(true) }

  // Press N anywhere (outside form fields) to log a trade.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      const typing = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable
      if (e.key.toLowerCase() === 'n' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        openCreate()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar onLogTrade={openCreate} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-24 md:pb-8">
          <motion.div key={pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
            className="max-w-[1280px] mx-auto">
            <Outlet context={{ openEditDrawer, onLogTrade: openCreate }} />
          </motion.div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex justify-around px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        {NAV_LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10.5px] font-medium"
            style={({ isActive }) => ({ color: isActive ? 'var(--brand)' : 'var(--text3)' })}>
            <Icon size={19} />{label}
          </NavLink>
        ))}
      </nav>

      <TradeDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} editId={editId} />
    </div>
  )
}
