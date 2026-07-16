import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import type { SectorPerf } from '../../types'
import { fCurrency } from '../../utils/formatters'

export default function SectorChart({ data }: { data: SectorPerf[] }) {
  if (!data?.length) return <p className="text-center text-[13px] py-8" style={{ color: 'var(--text3)' }}>No data</p>

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text3)', fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="sector" tick={{ fontSize: 11, fill: 'var(--text2)' }} axisLine={false} tickLine={false} width={70} />
        <Tooltip
          contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, fontFamily: 'JetBrains Mono' }}
          formatter={(v: number) => [fCurrency(v), 'Avg P&L']}
        />
        <Bar dataKey="avgPnl" radius={[0, 6, 6, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.avgPnl >= 0 ? 'var(--profit)' : 'var(--loss)'} fillOpacity={0.75} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
