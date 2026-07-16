import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { fCurrency } from '../../utils/formatters'

export default function PnlBadge({ pnl, showIcon = true }: { pnl: number; showIcon?: boolean }) {
  const positive = pnl >= 0
  return (
    <span
      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[12px] font-semibold mono"
      style={{
        background: positive ? 'var(--profit-bg)' : 'var(--loss-bg)',
        color:      positive ? 'var(--profit)'    : 'var(--loss)',
      }}
    >
      {showIcon && (positive
        ? <ArrowUpRight size={12} />
        : <ArrowDownRight size={12} />
      )}
      {fCurrency(Math.abs(pnl))}
    </span>
  )
}
