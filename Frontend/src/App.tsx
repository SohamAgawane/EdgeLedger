import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/themeStore'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout     from './components/layout/AppLayout'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Dashboard     from './pages/Dashboard'
import Journal       from './pages/Journal'
import Analytics     from './pages/Analytics'
import Watchlist     from './pages/Watchlist'
import Rules         from './pages/Rules'
import Settings      from './pages/Settings'

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 2 * 60 * 1000 } } })

export default function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="journal"   element={<Journal />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="watchlist" element={<Watchlist />} />
              <Route path="rules"     element={<Rules />} />
              <Route path="settings"  element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--card)', color: 'var(--text)',
            border: '1px solid var(--border)', borderRadius: 10,
            fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif',
          },
        }}
      />
    </QueryClientProvider>
  )
}
