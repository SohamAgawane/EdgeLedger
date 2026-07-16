import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import TradeDrawer from '../trade/TradeDrawer'

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editId, setEditId] = useState<string | undefined>()

  const openEditDrawer = (id: string) => {
    setEditId(id)
    setDrawerOpen(true)
  }

  const openCreate = () => {
    setEditId(undefined)
    setDrawerOpen(true)
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <Navbar onLogTrade={openCreate} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet
            context={{
              openEditDrawer,
              onLogTrade: openCreate,
            }}
          />
        </main>
      </div>

      <TradeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editId={editId}
      />
    </div>
  )
}