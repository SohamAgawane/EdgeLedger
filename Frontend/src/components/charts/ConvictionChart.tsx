import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from 'recharts'
import type { ConvictionItem } from '../../types'
import { fCurrency } from '../../utils/formatters'

export default function ConvictionChart({ data }: { data: ConvictionItem[] }) {
  if (!data?.length) return <p className="text-center text-[13px] py-8" style={{ color: 'var(--text3)' }}>No data</p>

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="convictionScore" tick={{ fontSize: 11, fill: 'var(--text2)' }} axisLine={false} tickLine={false} label={{ value: 'Conviction', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'var(--text3)' }} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text3)', fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
        <ReferenceLine y={0} stroke="var(--border2)" strokeWidth={1.5} />
        <Tooltip
          contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, fontFamily: 'JetBrains Mono' }}
          formatter={(v: number) => [fCurrency(v), 'Avg P&L']}
          labelFormatter={(l) => `Conviction ${l}/10`}
        />
        <Bar dataKey="avgPnl" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.avgPnl >= 0 ? 'var(--brand)' : 'var(--loss)'} fillOpacity={0.75} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
