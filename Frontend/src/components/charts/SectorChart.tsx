import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from 'recharts'
import type { SectorPerf } from '../../types'
import { fCurrency, fCompact } from '../../utils/formatters'
import { tooltipStyle, axisTick, axisTickText } from './chartTheme'

export default function SectorChart({ data }: { data: SectorPerf[] }) {
  if (!data?.length) return <p className="text-center text-[13px] py-8" style={{ color: 'var(--text3)' }}>Log trades in a few sectors to compare them.</p>
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }} barCategoryGap={10}>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tick={axisTick} tickFormatter={(v) => fCompact(v)} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="sector" tick={axisTickText} axisLine={false} tickLine={false} width={84} />
        <ReferenceLine x={0} stroke="var(--border2)" />
        <Tooltip {...tooltipStyle} formatter={(v: number) => [fCurrency(v), 'Avg P&L']} />
        <Bar dataKey="avgPnl" radius={4} maxBarSize={18}>
          {data.map((d, i) => <Cell key={i} fill={d.avgPnl >= 0 ? 'var(--profit)' : 'var(--loss)'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
