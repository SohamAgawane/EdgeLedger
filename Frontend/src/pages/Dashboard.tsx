import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, BarChart3, Target,
  Clock, AlertTriangle, Award, Activity, BookOpen, Zap
} from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import { useTrades } from '../hooks/useTrades'
import KpiCard from '../components/ui/KpiCard'
import PerformanceChart from '../components/charts/PerformanceChart'
import MistakeDonut from '../components/charts/MistakeDonut'
import SectorChart from '../components/charts/SectorChart'
import WeekdayChart from '../components/charts/WeekdayChart'
import RiskChart from '../components/charts/RiskChart'
import { CardSkeleton } from '../components/ui/Skeleton'
import { fCurrency, fPercent, fDays, labelMap } from '../utils/formatters'

export default function Dashboard() {
  const { data, isLoading } = useDashboard()
  const { data: tradeData } = useTrades({ limit: 200 })

  if (isLoading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  )

  const d = data
  const bestSector = d?.sectorPerformance?.[0]
  const worstDay = [...(d?.weekdayPerformance ?? [])].sort((a, b) => a.avgPnl - b.avgPnl)[0]
  const bestDay = d?.weekdayPerformance?.reduce((a, b) => b.avgPnl > a.avgPnl ? b : a, d.weekdayPerformance[0])
  const topMistake = d?.mistakeDistribution?.[0]
  const riskWarnings = d?.riskConcentration?.filter((r) => r.isOverConcentrated).length ?? 0
  const profitFactor = (() => {
    if (!tradeData?.trades.length) return null
    const wins = tradeData.trades.filter((t) => t.pnl > 0).reduce((a, t) => a + t.pnl, 0)
    const loss = Math.abs(tradeData.trades.filter((t) => t.pnl < 0).reduce((a, t) => a + t.pnl, 0))
    return loss === 0 ? null : (wins / loss).toFixed(2)
  })()

  const winStreak = (() => {
    if (!tradeData?.trades?.length) return 0

    const sorted = [...tradeData.trades]
      .filter((t) => t.pnl != null)
      .sort(
        (a, b) =>
          new Date(b.entryDate).getTime() -
          new Date(a.entryDate).getTime()
      )

    console.log("Sorted Trades:", sorted)

    let streak = 0

    for (const trade of sorted) {
      console.log(
        trade.symbol,
        "PNL:",
        trade.pnl,
        "Entry:",
        trade.entryDate
      )

      if (trade.pnl > 0) {
        streak++
      } else {
        break
      }
    }

    console.log("Win Streak =", streak)

    return streak
  })()

  return (
    <div className="space-y-5">
      {/* KPI Row 1 — Financial */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text3)' }}>
          Performance Overview
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard index={0} title="Total P&L" value={fCurrency(d?.avgPnl?.totalPnl ?? 0)}
            icon={d?.avgPnl?.totalPnl ?? 0 >= 0 ? TrendingUp : TrendingDown}
            trend={d?.avgPnl?.totalPnl ?? 0 >= 0 ? 'up' : 'down'}
            accent={d?.avgPnl?.totalPnl ?? 0 >= 0 ? 'var(--profit)' : 'var(--loss)'}
            mono trendValue={fCurrency(d?.avgPnl?.avgPnl ?? 0) + ' avg'} />
          <KpiCard index={1} title="Win Rate" value={fPercent(d?.winRate?.winRate ?? 0)}
            icon={Target}
            trend={(d?.winRate?.winRate ?? 0) >= 50 ? 'up' : 'down'}
            subtitle={`${d?.winRate?.winningTrades ?? 0} of ${d?.winRate?.totalTrades ?? 0} trades`}
            mono />
          <KpiCard index={2} title="Total Trades" value={String(d?.winRate?.totalTrades ?? 0)}
            icon={BookOpen} mono subtitle="logged trades" />
          <KpiCard index={3} title="Avg Holding" value={fDays(d?.avgHoldingPeriod?.avgHoldingDays ?? 0)}
            icon={Clock} mono subtitle="per trade" />
        </div>
      </div>

      {/* KPI Row 2 — Behavioral */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text3)' }}>
          Behavioral Intelligence
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard index={4} title="Best Sector"
            value={bestSector?.sector ?? '—'}
            icon={Award}
            accent="var(--profit)"
            trendValue={bestSector ? fCurrency(bestSector.avgPnl) + ' avg' : undefined}
            trend="up" />
          <KpiCard index={5} title="Top Mistake"
            value={labelMap[topMistake?.mistake ?? ''] ?? '—'}
            icon={AlertTriangle}
            accent="var(--warn)"
            subtitle={topMistake ? `${topMistake.count} times` : undefined} />
          <KpiCard index={6} title="Win Streak"
            value={`${winStreak}`}
            icon={Zap}
            accent="var(--brand)"
            subtitle="consecutive wins" />
          <KpiCard index={7} title="Profit Factor"
            value={profitFactor ? `${profitFactor}x` : '—'}
            icon={Activity}
            trend={Number(profitFactor) > 1 ? 'up' : 'down'}
            mono subtitle="gross win / gross loss" />
        </div>
      </div>

      {/* Risk warnings */}
      {riskWarnings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'var(--warn-bg)', border: '1px solid color-mix(in srgb, var(--warn) 25%, transparent)' }}
        >
          <AlertTriangle size={16} style={{ color: 'var(--warn)' }} />
          <p className="text-[13px] font-medium" style={{ color: 'var(--warn)' }}>
            {riskWarnings} sector{riskWarnings > 1 ? 's' : ''} exceed 30% capital concentration.
            Review your risk allocation.
          </p>
        </motion.div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <p className="text-[13px] font-bold mb-4" style={{ color: 'var(--text)' }}>Cumulative Performance</p>
          <div style={{ height: 220 }}>
            <PerformanceChart trades={tradeData?.trades ?? []} />
          </div>
        </div>
        <div className="card p-5">
          <p className="text-[13px] font-bold mb-4" style={{ color: 'var(--text)' }}>Mistake Distribution</p>
          <div style={{ height: 220 }}>
            <MistakeDonut data={d?.mistakeDistribution ?? []} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <p className="text-[13px] font-bold mb-4" style={{ color: 'var(--text)' }}>Sector Performance</p>
          <div style={{ height: 300 }}>
            <SectorChart data={d?.sectorPerformance ?? []} />
          </div>
        </div>
        <div className="card p-5">
          <p className="text-[13px] font-bold mb-4" style={{ color: 'var(--text)' }}>Weekday Performance</p>
          <div style={{ height: 300 }}>
            <WeekdayChart data={d?.weekdayPerformance ?? []} />
          </div>
        </div>
        {/* <div className="card p-5">
          <p className="text-[13px] font-bold mb-4" style={{ color: 'var(--text)' }}>Risk Concentration</p>
          <RiskChart data={d?.riskConcentration ?? []} />
        </div> */}
      </div>
    </div>
  )
}
