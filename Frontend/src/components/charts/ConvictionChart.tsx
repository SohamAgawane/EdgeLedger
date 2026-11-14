import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from 'recharts'
import type { ConvictionItem } from '../../types'
import { fCurrency, fCompact } from '../../utils/formatters'
import { tooltipStyle, axisTick, axisTickText } from './chartTheme'

export default function ConvictionChart({ data }: { data: ConvictionItem[] }) {
  if (!data?.length) return <p className="text-center text-[13px] py-8" style={{ color: 'var(--text3)' }}>Add a conviction score (1–10) when logging trades.</p>
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 14 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="convictionScore" tick={axisTickText} axisLine={false} tickLine={false}
          label={{ value: 'Conviction score', position: 'insideBottom', offset: -8, fontSize: 11, fill: 'var(--text3)' }} />
        <YAxis tick={axisTick} tickFormatter={(v) => fCompact(v)} axisLine={false} tickLine={false} width={52} />
        <ReferenceLine y={0} stroke="var(--border2)" />
        <Tooltip {...tooltipStyle} formatter={(v: number) => [fCurrency(v), 'Avg P&L']} labelFormatter={(l) => `Conviction ${l}/10`} />
        <Bar dataKey="avgPnl" radius={4} maxBarSize={32}>
          {data.map((d, i) => <Cell key={i} fill={d.avgPnl >= 0 ? 'var(--brand)' : 'var(--loss)'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
