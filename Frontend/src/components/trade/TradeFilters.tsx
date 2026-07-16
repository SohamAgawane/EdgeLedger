import Select from '../ui/Select'
import { SECTOR_OPTIONS, MISTAKE_OPTIONS } from '../../types'
import type { TradeFilters as F } from '../../api/trades'

interface Props {
  filters: F
  onChange: (f: Partial<F>) => void
  onClear: () => void
}

export default function TradeFilters({ filters, onChange, onClear }: Props) {
  const sectorOpts = SECTOR_OPTIONS.map((s) => ({ value: s, label: s }))
  const mistakeOpts = MISTAKE_OPTIONS.map((m) => ({ value: m, label: m }))

  return (
    <div className="card p-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Select
          options={sectorOpts} placeholder="All Sectors" value={filters.sector ?? ''}
          onChange={(e) => onChange({ sector: e.target.value || undefined })}
        />
        <Select
          options={mistakeOpts} placeholder="All Mistakes" value={filters.mistakeCategory ?? ''}
          onChange={(e) => onChange({ mistakeCategory: e.target.value || undefined })}
        />
        <input
          type="date" className="input-base" placeholder="From"
          value={filters.from ?? ''} onChange={(e) => onChange({ from: e.target.value || undefined })}
        />
        <input
          type="date" className="input-base" placeholder="To"
          value={filters.to ?? ''} onChange={(e) => onChange({ to: e.target.value || undefined })}
        />
        <input
          type="number" className="input-base" placeholder="Min P&L"
          value={filters.minPnl ?? ''} onChange={(e) => onChange({ minPnl: e.target.value || undefined })}
        />
        <div className="flex gap-2">
          <input
            type="number" className="input-base" placeholder="Max P&L"
            value={filters.maxPnl ?? ''} onChange={(e) => onChange({ maxPnl: e.target.value || undefined })}
          />
          <button className="btn-ghost text-[12px] px-3 shrink-0" onClick={onClear}>Clear</button>
        </div>
      </div>
    </div>
  )
}
