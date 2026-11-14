import { useState, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Upload, SlidersHorizontal, BookOpen, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTrades, useImportCsv } from '../hooks/useTrades'
import type { TradeFilters } from '../api/trades'
import TradeTable from '../components/trade/TradeTable'
import TradeFilter from '../components/trade/TradeFilters'
import EmptyState from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'

const BASE: TradeFilters = { page: 1, limit: 20 }

export default function Journal() {
  const { openEditDrawer, onLogTrade } = useOutletContext<{ openEditDrawer: (id: string) => void; onLogTrade: () => void }>()
  const [filters, setFilters] = useState<TradeFilters>(BASE)
  const [showFilters, setShowFilters] = useState(false)
  const { mutate: importCsv, isPending: importing } = useImportCsv()
  const fileRef = useRef<HTMLInputElement>(null)
  const { data, isLoading } = useTrades(filters)

  const trades = data?.trades ?? []
  const pg = data?.pagination
  const activeFilters = ['sector', 'mistakeCategory', 'from', 'to', 'minPnl', 'maxPnl'].filter((k) => (filters as Record<string, unknown>)[k]).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[14px]" style={{ color: 'var(--text2)' }}>
          {pg ? <><span className="font-semibold" style={{ color: 'var(--text)' }}>{pg.totalCount}</span> {pg.totalCount === 1 ? 'trade' : 'trades'} in your journal</> : 'Loading trades…'}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost !py-2 !px-3.5 text-[13.5px]"
            style={{ borderColor: showFilters || activeFilters ? 'var(--brand)' : undefined, color: showFilters || activeFilters ? 'var(--brand)' : undefined }}>
            <SlidersHorizontal size={15} /> Filters{activeFilters > 0 && <span className="ml-0.5 px-1.5 rounded-full text-[11px] font-semibold" style={{ background: 'var(--brand)', color: 'var(--card)' }}>{activeFilters}</span>}
          </button>
          <button onClick={() => fileRef.current?.click()} disabled={importing} className="btn-ghost !py-2 !px-3.5 text-[13.5px]">
            <Upload size={15} /> {importing ? 'Importing…' : 'Import CSV'}
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) { importCsv(e.target.files[0]); e.target.value = '' } }} />
        </div>
      </div>

      {showFilters && (
        <TradeFilter filters={filters} onChange={(f) => setFilters((p) => ({ ...p, ...f, page: 1 }))} onClear={() => setFilters(BASE)} />
      )}

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : trades.length === 0 && !activeFilters ? (
        <EmptyState icon={BookOpen} title="No trades yet"
          description="Log your first trade, or import a CSV, to start tracking the behavior behind your results."
          action={<button onClick={onLogTrade} className="btn-primary"><Plus size={16} /> Log trade</button>} />
      ) : (
        <TradeTable trades={trades} onEdit={openEditDrawer} />
      )}

      {pg && pg.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))} disabled={(filters.page ?? 1) <= 1}
            className="btn-ghost !py-2 !px-3 text-[13px]"><ChevronLeft size={15} /> Previous</button>
          <span className="text-[13px] mono" style={{ color: 'var(--text3)' }}>{pg.currentPage} / {pg.totalPages}</span>
          <button onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))} disabled={(filters.page ?? 1) >= pg.totalPages}
            className="btn-ghost !py-2 !px-3 text-[13px]">Next <ChevronRight size={15} /></button>
        </div>
      )}
    </div>
  )
}
