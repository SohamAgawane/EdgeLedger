import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { Trade } from '../../types'
import { fDateShort, fCurrency } from '../../utils/formatters'
import { parseISO, format } from 'date-fns'

interface Props { trades: Trade[] }

export default function PerformanceChart({ trades }: Props) {
  const data = [...trades]
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
    .reduce<{ date: string; cumPnl: number }[]>((acc, t) => {
      const prev = acc[acc.length - 1]?.cumPnl ?? 0
      acc.push({ date: fDateShort(t.entryDate), cumPnl: +(prev + t.pnl).toFixed(2) })
      return acc
    }, [])

  if (!data.length) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-[13px]" style={{ color: 'var(--text3)' }}>No trade data yet</p>
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--brand)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--brand)" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text3)', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text3)', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, fontFamily: 'JetBrains Mono' }}
          labelStyle={{ color: 'var(--text2)', marginBottom: 4 }}
          formatter={(v: number) => [fCurrency(v), 'Cumulative P&L']}
        />
        <Area type="monotone" dataKey="cumPnl" stroke="var(--brand)" strokeWidth={2} fill="url(#pnlGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
