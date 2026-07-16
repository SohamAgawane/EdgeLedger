import { useDashboard } from '../hooks/useDashboard'
import { useTrades } from '../hooks/useTrades'
import KpiCard from '../components/ui/KpiCard'
import PerformanceChart from '../components/charts/PerformanceChart'
import MistakeDonut from '../components/charts/MistakeDonut'
import SectorChart from '../components/charts/SectorChart'
import WeekdayChart from '../components/charts/WeekdayChart'
import ConvictionChart from '../components/charts/ConvictionChart'
import RiskChart from '../components/charts/RiskChart'
import { CardSkeleton } from '../components/ui/Skeleton'
import { fCurrency, fPercent, fDays, labelMap } from '../utils/formatters'
import { Target, TrendingUp, Clock, BarChart3, AlertTriangle, Activity } from 'lucide-react'

export default function Analytics() {
  const { data, isLoading } = useDashboard()
  const { data: tradeData } = useTrades({ limit: 500 })

  if (isLoading) return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  )

  const d = data
  const bestSector = d?.sectorPerformance?.[0]
  const worstSector =
  d?.sectorPerformance?.length
    ? d.sectorPerformance[d.sectorPerformance.length - 1]
    : undefined
  const bestDay = d?.weekdayPerformance?.reduce((a, b) => b.avgPnl > a.avgPnl ? b : a, d.weekdayPerformance[0])
  const worstDay = d?.weekdayPerformance?.reduce((a, b) => b.avgPnl < a.avgPnl ? b : a, d.weekdayPerformance[0])
  const topConviction = d?.convictionVsProfit?.reduce((a, b) => b.avgPnl > a.avgPnl ? b : a, d.convictionVsProfit[0])

  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard index={0} title="Win Rate" value={fPercent(d?.winRate?.winRate ?? 0)}
          icon={Target} mono
          trend={(d?.winRate?.winRate ?? 0) >= 50 ? 'up' : 'down'}
          subtitle={`${d?.winRate?.winningTrades} wins / ${d?.winRate?.totalTrades} trades`} />
        <KpiCard index={1} title="Avg P&L / Trade" value={fCurrency(d?.avgPnl?.avgPnl ?? 0)}
          icon={TrendingUp} mono
          trend={(d?.avgPnl?.avgPnl ?? 0) >= 0 ? 'up' : 'down'}
          accent={(d?.avgPnl?.avgPnl ?? 0) >= 0 ? 'var(--profit)' : 'var(--loss)'} />
        <KpiCard index={2} title="Avg Holding Period" value={fDays(d?.avgHoldingPeriod?.avgHoldingDays ?? 0)}
          icon={Clock} mono subtitle="per trade" />
        <KpiCard index={3} title="Best Sector"
          value={bestSector?.sector ?? '—'} icon={BarChart3}
          accent="var(--profit)"
          trendValue={bestSector ? fCurrency(bestSector.avgPnl) : undefined} trend="up" />
        <KpiCard index={4} title="Worst Sector"
          value={worstSector?.sector ?? '—'} icon={AlertTriangle}
          accent="var(--loss)"
          trendValue={worstSector ? fCurrency(worstSector.avgPnl) : undefined} trend="down" />
        <KpiCard index={5} title="Best Conviction"
          value={topConviction ? `Score ${topConviction.convictionScore}` : '—'} icon={Activity}
          accent="var(--brand)"
          subtitle={topConviction ? fCurrency(topConviction.avgPnl) + ' avg P&L' : undefined} />
      </div>

      {/* Best/Worst day callout */}
      {bestDay && worstDay && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card2 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text3)' }}>Best Trading Day</p>
            <p className="text-[20px] font-bold" style={{ color: 'var(--profit)' }}>{bestDay.day}</p>
            <p className="text-[12px] mono mt-0.5" style={{ color: 'var(--text2)' }}>{fCurrency(bestDay.avgPnl)} avg P&L</p>
          </div>
          <div className="card2 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text3)' }}>Worst Trading Day</p>
            <p className="text-[20px] font-bold" style={{ color: 'var(--loss)' }}>{worstDay.day}</p>
            <p className="text-[12px] mono mt-0.5" style={{ color: 'var(--text2)' }}>{fCurrency(worstDay.avgPnl)} avg P&L</p>
          </div>
        </div>
      )}

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <p className="text-[13px] font-bold mb-4" style={{ color: 'var(--text)' }}>Cumulative Performance</p>
          <div style={{ height: 220 }}><PerformanceChart trades={tradeData?.trades ?? []} /></div>
        </div>
        <div className="card p-5">
          <p className="text-[13px] font-bold mb-4" style={{ color: 'var(--text)' }}>Conviction vs Profit</p>
          <p className="text-[12px] mb-3" style={{ color: 'var(--text3)' }}>Does your confidence predict your results?</p>
          <div style={{ height: 200 }}><ConvictionChart data={d?.convictionVsProfit ?? []} /></div>
        </div>
        <div className="card p-5">
          <p className="text-[13px] font-bold mb-4" style={{ color: 'var(--text)' }}>Sector Performance</p>
          <div style={{ height: 220 }}><SectorChart data={d?.sectorPerformance ?? []} /></div>
        </div>
        <div className="card p-5">
          <p className="text-[13px] font-bold mb-4" style={{ color: 'var(--text)' }}>Weekday Performance</p>
          <div style={{ height: 220 }}><WeekdayChart data={d?.weekdayPerformance ?? []} /></div>
        </div>
        {/* <div className="card p-5">
          <p className="text-[13px] font-bold mb-4" style={{ color: 'var(--text)' }}>Mistake Distribution</p>
          <div style={{ height: 220 }}><MistakeDonut data={d?.mistakeDistribution ?? []} /></div>
        </div> */}
        <div className="card p-5 lg:col-span-2">
          <p
            className="text-[13px] font-bold mb-2"
            style={{ color: 'var(--text)' }}
          >
            Risk Concentration
          </p>
          <p
            className="text-[12px] mb-4"
            style={{ color: 'var(--text3)' }}
          >
            Capital allocation by sector. Flag triggers at 30%.
          </p>
          <RiskChart data={d?.riskConcentration ?? []} />
        </div>
      </div>
    </div>
  )
}
