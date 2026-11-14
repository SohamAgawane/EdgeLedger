import { Link, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, BookOpen, Plus, Upload } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import { useTrades } from '../hooks/useTrades'
import { useAuthStore } from '../store/authStore'
import PerformanceChart from '../components/charts/PerformanceChart'
import MistakeDonut from '../components/charts/MistakeDonut'
import SectorChart from '../components/charts/SectorChart'
import WeekdayChart from '../components/charts/WeekdayChart'
import { Skeleton, CardSkeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { fCurrency, fPercent, fDays, labelMap } from '../utils/formatters'

function Stat({ label, value, hint, color }: { label: string; value: string; hint?: string; color?: string }) {
  return (
    <div className="px-5 py-4 min-w-0">
      <p className="text-[12.5px] font-medium" style={{ color: 'var(--text3)' }}>{label}</p>
      <p className="mono text-[22px] font-semibold mt-1 truncate" style={{ color: color ?? 'var(--text)' }}>{value}</p>
      {hint && <p className="text-[12px] mt-0.5 truncate" style={{ color: 'var(--text3)' }}>{hint}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { onLogTrade } = useOutletContext<{ onLogTrade: () => void }>()
  const user = useAuthStore((s) => s.user)
  const { data: d, isLoading } = useDashboard()
  const { data: tradeData } = useTrades({ limit: 200 })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const first = user?.fullName?.split(' ')[0] ?? 'trader'

  if (isLoading) return (
    <div className="space-y-5">
      <Skeleton className="h-10 w-72" />
      <div className="grid lg:grid-cols-3 gap-5"><Skeleton className="h-[380px] lg:col-span-2" /><Skeleton className="h-[380px]" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
    </div>
  )

  const total = d?.winRate?.totalTrades ?? 0
  const totalPnl = d?.avgPnl?.totalPnl ?? 0
  const up = totalPnl >= 0
  const closed = (tradeData?.trades ?? []).filter((t) => !t.isOpen)

  if (total === 0) return (
    <div className="space-y-6">
      <Header greeting={greeting} first={first} />
      <EmptyState icon={BookOpen} title="Your journal is empty"
        description="Log a trade with the emotion behind it, or import your history from a CSV. Your analytics appear as soon as you have a few closed trades."
        action={
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={onLogTrade} className="btn-primary"><Plus size={16} /> Log your first trade</button>
            <Link to="/journal" className="btn-ghost"><Upload size={15} /> Import a CSV</Link>
          </div>
        } />
    </div>
  )

  const topMistake = (d?.mistakeDistribution ?? []).filter((m) => m.mistake !== 'none')[0]
  const bestSector = d?.sectorPerformance?.[0]
  const bestDay = d?.weekdayPerformance?.length ? d.weekdayPerformance.reduce((a, b) => (b.avgPnl > a.avgPnl ? b : a)) : undefined
  const riskWarnings = d?.riskConcentration?.filter((r) => r.isOverConcentrated).length ?? 0

  const wins = closed.filter((t) => t.pnl > 0).reduce((a, t) => a + t.pnl, 0)
  const losses = Math.abs(closed.filter((t) => t.pnl < 0).reduce((a, t) => a + t.pnl, 0))
  const profitFactor = losses > 0 ? wins / losses : null

  let winStreak = 0
  for (const t of [...closed].sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())) {
    if (t.pnl > 0) winStreak++
    else break
  }

  return (
    <div className="space-y-5">
      <Header greeting={greeting} first={first} />

      {riskWarnings > 0 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'var(--warn-bg)', border: '1px solid color-mix(in srgb, var(--warn) 30%, transparent)' }}>
          <AlertTriangle size={17} style={{ color: 'var(--warn)' }} className="shrink-0" />
          <p className="text-[13.5px] font-medium flex-1" style={{ color: 'var(--warn)' }}>
            {riskWarnings} sector{riskWarnings > 1 ? 's hold' : ' holds'} more than 30% of your capital.
          </p>
          <Link to="/analytics" className="text-[13px] font-semibold underline underline-offset-2" style={{ color: 'var(--warn)' }}>Review</Link>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-5 sm:p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[13px] font-medium" style={{ color: 'var(--text2)' }}>Net P&L</p>
              <p className="font-display text-[38px] sm:text-[46px] font-bold leading-tight num" style={{ color: up ? 'var(--profit)' : 'var(--loss)' }}>
                {up && totalPnl > 0 ? '+' : ''}{fCurrency(totalPnl)}
              </p>
              <p className="text-[13px]" style={{ color: 'var(--text3)' }}>{fCurrency(d?.avgPnl?.avgPnl ?? 0)} average per trade</p>
            </div>
            {(bestSector || bestDay) && (
              <div className="text-[13px] space-y-1 sm:text-right" style={{ color: 'var(--text2)' }}>
                {bestSector && <p>Best sector: <span className="font-semibold" style={{ color: 'var(--text)' }}>{bestSector.sector}</span></p>}
                {bestDay && <p>Best day: <span className="font-semibold" style={{ color: 'var(--text)' }}>{bestDay.day}</span></p>}
              </div>
            )}
          </div>
          <div className="flex-1 min-h-[240px] mt-4"><PerformanceChart trades={tradeData?.trades ?? []} /></div>
        </div>

        <div className="card p-5 sm:p-6 flex flex-col">
          <p className="section-title">Mistakes you repeat</p>
          <p className="section-sub">Count of tagged mistakes across all trades.</p>
          <div className="flex-1 min-h-[220px] mt-3"><MistakeDonut data={d?.mistakeDistribution ?? []} /></div>
          {topMistake && (
            <p className="mt-3 pt-3 text-[13px]" style={{ borderTop: '1px solid var(--border)', color: 'var(--text2)' }}>
              Most repeated: <span className="font-semibold" style={{ color: 'var(--warn)' }}>{labelMap[topMistake.mistake] ?? topMistake.mistake}</span> ({topMistake.count}×)
            </p>
          )}
        </div>
      </div>

      <div className="card grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 [&>*]:border-[var(--border)] [&>*:not(:first-child)]:border-l">
        <Stat label="Win rate" value={fPercent(d?.winRate?.winRate ?? 0)} color={(d?.winRate?.winRate ?? 0) >= 50 ? 'var(--profit)' : 'var(--loss)'}
          hint={`${d?.winRate?.winningTrades ?? 0} of ${total} trades`} />
        <Stat label="Profit factor" value={profitFactor ? `${profitFactor.toFixed(2)}×` : '—'} color={profitFactor && profitFactor >= 1 ? 'var(--profit)' : undefined} hint="gross wins ÷ gross losses" />
        <Stat label="Total trades" value={String(total)} hint="logged in journal" />
        <Stat label="Avg holding" value={fDays(d?.avgHoldingPeriod?.avgHoldingDays ?? 0)} hint="per closed trade" />
        <Stat label="Win streak" value={String(winStreak)} hint="most recent wins in a row" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5 sm:p-6">
          <p className="section-title">Sector performance</p>
          <p className="section-sub">Average P&L per trade.</p>
          <div className="h-[300px] mt-4"><SectorChart data={d?.sectorPerformance ?? []} /></div>
        </div>
        <div className="card p-5 sm:p-6">
          <p className="section-title">Weekday performance</p>
          <p className="section-sub">Average P&L per trade by day entered.</p>
          <div className="h-[300px] mt-4"><WeekdayChart data={d?.weekdayPerformance ?? []} /></div>
        </div>
      </div>
    </div>
  )
}

function Header({ greeting, first }: { greeting: string; first: string }) {
  return (
    <div>
      <h2 className="text-[28px] sm:text-[34px] font-bold leading-tight" style={{ color: 'var(--text)' }}>{greeting}, {first}</h2>
      <p className="text-[14px] mt-1" style={{ color: 'var(--text3)' }}>
        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  )
}
