import type { RiskItem } from '../../types'
import { AlertTriangle } from 'lucide-react'

export default function RiskChart({ data }: { data: RiskItem[] }) {
  if (!data?.length) return <p className="text-center text-[13px] py-8" style={{ color: 'var(--text3)' }}>No data</p>

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.sector}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{d.sector}</span>
              {d.isOverConcentrated && (
                <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}>
                  <AlertTriangle size={10} /> Over 30%
                </span>
              )}
            </div>
            <span className="mono text-[12px] font-medium" style={{ color: 'var(--text2)' }}>
              {d.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(d.percentage, 100)}%`,
                background: d.isOverConcentrated ? 'var(--warn)' : 'var(--brand)',
                opacity: 0.7,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
