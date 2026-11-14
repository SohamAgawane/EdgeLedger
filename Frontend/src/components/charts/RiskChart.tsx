import type { RiskItem } from '../../types'
import { AlertTriangle } from 'lucide-react'
import { fCurrency } from '../../utils/formatters'

export default function RiskChart({ data }: { data: RiskItem[] }) {
  if (!data?.length) return <p className="text-center text-[13px] py-8" style={{ color: 'var(--text3)' }}>Open positions will show how your capital is spread across sectors.</p>

  return (
    <div className="space-y-4">
      {data.map((d) => (
        <div key={d.sector}>
          <div className="flex items-center justify-between mb-1.5 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[13.5px] font-medium truncate" style={{ color: 'var(--text)' }}>{d.sector}</span>
              {d.isOverConcentrated && (
                <span className="flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md shrink-0"
                  style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}>
                  <AlertTriangle size={10} /> Over 30%
                </span>
              )}
            </div>
            <span className="mono text-[12.5px] shrink-0" style={{ color: 'var(--text2)' }}>
              {fCurrency(d.totalCapital)} <span style={{ color: 'var(--text)' }}>· {d.percentage.toFixed(1)}%</span>
            </span>
          </div>
          <div className="relative h-2 rounded-full" style={{ background: 'var(--bg2)', boxShadow: 'inset 0 0 0 1px var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(d.percentage, 100)}%`, background: d.isOverConcentrated ? 'var(--warn)' : 'var(--brand)' }} />
            <span className="absolute top-[-3px] h-[14px] w-px" style={{ left: '30%', background: 'var(--text3)', opacity: 0.6 }} title="30% limit" />
          </div>
        </div>
      ))}
    </div>
  )
}
