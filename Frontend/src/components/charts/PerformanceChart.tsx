import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import type { Trade } from '../../types'
import { fDateShort, fCurrency, fCompact } from '../../utils/formatters'
import { tooltipStyle, axisTick } from './chartTheme'

export default function PerformanceChart({ trades }: { trades: Trade[] }) {
  const data = [...trades]
    .filter((t) => !t.isOpen)
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
    .reduce<{ date: string; cumPnl: number }[]>((acc, t) => {
      const prev = acc[acc.length - 1]?.cumPnl ?? 0
      acc.push({ date: fDateShort(t.entryDate), cumPnl: +(prev + t.pnl).toFixed(2) })
      return acc
    }, [])

  if (!data.length) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-[13px]" style={{ color: 'var(--text3)' }}>Your equity curve appears after your first closed trade.</p>
    </div>
  )

  const up = data[data.length - 1].cumPnl >= 0
  const color = up ? 'var(--profit)' : 'var(--loss)'

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" tick={axisTick} axisLine={false} tickLine={false} minTickGap={32} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => fCompact(v)} />
        <ReferenceLine y={0} stroke="var(--border2)" />
        <Tooltip {...tooltipStyle} formatter={(v: number) => [fCurrency(v), 'Cumulative P&L']} />
        <Area type="monotone" dataKey="cumPnl" stroke={color} strokeWidth={2.25} fill="url(#pnlGrad)" dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)', fill: color }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
