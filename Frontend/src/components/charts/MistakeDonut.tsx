import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { MistakeDist } from '../../types'
import { labelMap } from '../../utils/formatters'
import { tooltipStyle } from './chartTheme'

const COLORS = ['#7C6CFF', '#E05A8A', '#FFB020', '#2E8FD0', '#12A67A', '#E0743A', '#8B6FE0', '#4CC9C0', '#C0A04A', '#8A90A6']

export default function MistakeDonut({ data }: { data: MistakeDist[] }) {
  const rows = (data ?? []).filter((d) => d.mistake !== 'none')
  if (!rows.length) return <p className="text-center text-[13px] py-8" style={{ color: 'var(--text3)' }}>Tag mistakes on your trades to see which one repeats.</p>

  const total = rows.reduce((a, d) => a + d.count, 0)
  const chart = rows.map((d, i) => ({ name: labelMap[d.mistake] ?? d.mistake, value: d.count, color: COLORS[i % COLORS.length] }))

  return (
    <div className="flex items-center gap-4 h-full">
      <div className="relative w-[46%] h-full min-w-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chart} cx="50%" cy="50%" innerRadius="64%" outerRadius="92%" dataKey="value" paddingAngle={2} stroke="none">
              {chart.map((c, i) => <Cell key={i} fill={c.color} />)}
            </Pie>
            <Tooltip {...tooltipStyle} formatter={(v: number, name: string) => [v, name]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display text-[24px] font-bold leading-none" style={{ color: 'var(--text)' }}>{total}</span>
          <span className="text-[11px] mt-1" style={{ color: 'var(--text3)' }}>mistakes</span>
        </div>
      </div>
      <ul className="flex-1 min-w-0 space-y-1.5 overflow-y-auto max-h-full pr-1">
        {chart.map((c) => (
          <li key={c.name} className="flex items-center gap-2 text-[12.5px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
            <span className="truncate flex-1" style={{ color: 'var(--text2)' }}>{c.name}</span>
            <span className="mono" style={{ color: 'var(--text)' }}>{c.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
