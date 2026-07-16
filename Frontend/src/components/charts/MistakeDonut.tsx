import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { MistakeDist } from '../../types'
import { labelMap } from '../../utils/formatters'

const COLORS = ['#9B97F2','#B8B4F5','#D4D2F9','#7B78E8','#6B66E8','#5550D6','#8D89EF','#A5A2F5','#BEBCF8','#CEC9F5']

export default function MistakeDonut({ data }: { data: MistakeDist[] }) {
  if (!data?.length) return <p className="text-center text-[13px] py-8" style={{ color: 'var(--text3)' }}>No data</p>

  const chart = data.map((d, i) => ({
    name: labelMap[d.mistake] ?? d.mistake,
    value: d.count,
    color: COLORS[i % COLORS.length],
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={chart} cx="50%" cy="50%" innerRadius="55%" outerRadius="75%"
          dataKey="value" paddingAngle={3}>
          {chart.map((c, i) => <Cell key={i} fill={c.color} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
          formatter={(v: number, name: string) => [v, name]}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text2)' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
