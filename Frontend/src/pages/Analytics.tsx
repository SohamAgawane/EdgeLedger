import { Target, TrendingUp, Clock, BarChart3, AlertTriangle, Activity, CalendarDays } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import { useTrades } from '../hooks/useTrades'
import KpiCard from '../components/ui/KpiCard'
import PerformanceChart from '../components/charts/PerformanceChart'
import MistakeDonut from '../components/charts/MistakeDonut'
import SectorChart from '../components/charts/SectorChart'
import WeekdayChart from '../components/charts/WeekdayChart'
import ConvictionChart from '../components/charts/ConvictionChart'
import RiskChart from '../components/charts/RiskChart'
import { CardSkeleton, Skeleton } from '../components/ui/Skeleton'
import { fCurrency, fPercent, fDays } from '../utils/formatters'

function Panel({ title, sub, h = 260, className = '', children }: { title: string; sub?: string; h?: number; className?: string; children: React.ReactNode }) {
  return (
    <div className={`card p-5 sm:p-6 ${className}`}>
      <p className="section-title">{title}</p>
      {sub && <p className="section-sub">{sub}</p>}
      <div className="mt-4" style={{ height: h }}>{children}</div>
    </div>
  )
}

export default function Analytics() {
  const { data: d, isLoading } = useDashboard()
  const { data: tradeData } = useTrades({ limit: 500 })

  if (isLoading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      <Skeleton className="h-[300px]" />
    </div>
  )

  const sectors = d?.sectorPerformance ?? []
  const bestSector = sectors[0]
  const worstSector = sectors.length > 1 ? sectors[sectors.length - 1] : undefined
  const days = d?.weekdayPerformance ?? []
  const bestDay = days.length ? days.reduce((a, b) => (b.avgPnl > a.avgPnl ? b : a)) : undefined
  const worstDay = days.length ? days.reduce((a, b) => (b.avgPnl < a.avgPnl ? b : a)) : undefined
  const topConviction = d?.convictionVsProfit?.length ? d.convictionVsProfit.reduce((a, b) => (b.avgPnl > a.avgPnl ? b : a)) : undefined
  const winRate = d?.winRate?.winRate ?? 0
  const avg = d?.avgPnl?.avgPnl ?? 0

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard index={0} title="Win rate" value={fPercent(winRate)} icon={Target} mono trend={winRate >= 50 ? 'up' : 'down'}
          subtitle={`${d?.winRate?.winningTrades ?? 0} of ${d?.winRate?.totalTrades ?? 0} trades`} />
        <KpiCard index={1} title="Avg P&L per trade" value={fCurrency(avg)} icon={TrendingUp} mono trend={avg >= 0 ? 'up' : 'down'}
          accent={avg >= 0 ? 'var(--profit)' : 'var(--loss)'} />
        <KpiCard index={2} title="Avg holding period" value={fDays(d?.avgHoldingPeriod?.avgHoldingDays ?? 0)} icon={Clock} mono subtitle="per trade" />
        <KpiCard index={3} title="Best sector" value={bestSector?.sector ?? '—'} icon={BarChart3} accent="var(--profit)"
          trend="up" trendValue={bestSector ? fCurrency(bestSector.avgPnl) : undefined} />
        <KpiCard index={4} title="Weakest sector" value={worstSector?.sector ?? '—'} icon={AlertTriangle} accent="var(--loss)"
          trend="down" trendValue={worstSector ? fCurrency(worstSector.avgPnl) : undefined} />
        <KpiCard index={5} title="Best conviction" value={topConviction ? `Score ${topConviction.convictionScore}` : '—'} icon={Activity} accent="var(--brand)"
          subtitle={topConviction ? `${fCurrency(topConviction.avgPnl)} avg P&L` : undefined} />
      </div>

      {bestDay && worstDay && (
        <div className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-10">
          <span className="w-10 h-10 rounded-xl hidden sm:flex items-center justify-center shrink-0" style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}><CalendarDays size={19} /></span>
          <div className="flex-1">
            <p className="text-[13px]" style={{ color: 'var(--text3)' }}>Best trading day</p>
            <p className="font-display text-[24px] font-bold" style={{ color: 'var(--profit)' }}>{bestDay.day}</p>
            <p className="mono text-[12.5px]" style={{ color: 'var(--text2)' }}>{fCurrency(bestDay.avgPnl)} avg P&L</p>
          </div>
          <div className="hidden sm:block self-stretch w-px" style={{ background: 'var(--border)' }} />
          <div className="flex-1">
            <p className="text-[13px]" style={{ color: 'var(--text3)' }}>Worst trading day</p>
            <p className="font-display text-[24px] font-bold" style={{ color: 'var(--loss)' }}>{worstDay.day}</p>
            <p className="mono text-[12.5px]" style={{ color: 'var(--text2)' }}>{fCurrency(worstDay.avgPnl)} avg P&L</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Cumulative performance" sub="Running P&L across closed trades." className="lg:col-span-2" h={280}>
          <PerformanceChart trades={tradeData?.trades ?? []} />
        </Panel>
        <Panel title="Conviction vs profit" sub="Does your confidence predict your results?"><ConvictionChart data={d?.convictionVsProfit ?? []} /></Panel>
        <Panel title="Mistakes you repeat" sub="Count of tagged mistakes."><MistakeDonut data={d?.mistakeDistribution ?? []} /></Panel>
        <Panel title="Sector performance" sub="Average P&L per trade."><SectorChart data={sectors} /></Panel>
        <Panel title="Weekday performance" sub="Average P&L per trade by day entered."><WeekdayChart data={days} /></Panel>
        <div className="card p-5 sm:p-6 lg:col-span-2">
          <p className="section-title">Risk concentration</p>
          <p className="section-sub mb-5">Capital allocation by sector. The marker shows the 30% limit.</p>
          <RiskChart data={d?.riskConcentration ?? []} />
        </div>
      </div>
    </div>
  )
}
