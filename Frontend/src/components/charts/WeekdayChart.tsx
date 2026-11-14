import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from 'recharts'
import type { WeekdayPerf } from '../../types'
import { fCurrency, fCompact } from '../../utils/formatters'
import { tooltipStyle, axisTick, axisTickText } from './chartTheme'

export default function WeekdayChart({ data }: { data: WeekdayPerf[] }) {
  if (!data?.length) return <p className="text-center text-[13px] py-8" style={{ color: 'var(--text3)' }}>Weekday patterns show up after a week of trades.</p>
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" tick={axisTickText} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} tickFormatter={(v) => fCompact(v)} axisLine={false} tickLine={false} width={52} />
        <ReferenceLine y={0} stroke="var(--border2)" />
        <Tooltip {...tooltipStyle} formatter={(v: number) => [fCurrency(v), 'Avg P&L']} />
        <Bar dataKey="avgPnl" radius={4} maxBarSize={36}>
          {data.map((d, i) => <Cell key={i} fill={d.avgPnl >= 0 ? 'var(--profit)' : 'var(--loss)'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
