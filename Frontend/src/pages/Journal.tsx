import { useState, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Upload, Filter, BookOpen } from 'lucide-react'
import { useTrades, useImportCsv } from '../hooks/useTrades'
import type { TradeFilters } from '../api/trades'
import TradeTable from '../components/trade/TradeTable'
import TradeFilters from '../components/trade/TradeFilters.tsx'
import EmptyState from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'

export default function Journal() {
  const { openEditDrawer, onLogTrade } = useOutletContext<{
    openEditDrawer: (id: string) => void
    onLogTrade: () => void
  }>();
  const [filters, setFilters] = useState<TradeFilters>({ page: 1, limit: 20 })
  const [showFilters, setShowFilters] = useState(false)
  const { mutate: importCsv, isPending: importing } = useImportCsv()
  const fileRef = useRef<HTMLInputElement>(null)
  const { data, isLoading } = useTrades(filters)

  const trades = data?.trades ?? []
  const pg = data?.pagination

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>Trade Journal</h2>
          {pg && <p className="text-[12px] mt-0.5" style={{ color: 'var(--text3)' }}>{pg.totalCount} trades total</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-ghost text-[13px] py-2 px-3 gap-1.5"
            style={{ color: showFilters ? 'var(--brand)' : undefined, borderColor: showFilters ? 'var(--brand)' : undefined }}
          >
            <Filter size={14} /> Filters
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="btn-ghost text-[13px] py-2 px-3 gap-1.5"
          >
            <Upload size={14} /> {importing ? 'Importing…' : 'Import CSV'}
          </button>
          <input
            ref={fileRef} type="file" accept=".csv" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) importCsv(e.target.files[0]) }}
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <TradeFilters
          filters={filters}
          onChange={(f) => setFilters((p) => ({ ...p, ...f, page: 1 }))}
          onClear={() => setFilters({ page: 1, limit: 20 })}
        />
      )}

      {/* Table */}
      {
        isLoading ? (
          <TableSkeleton rows={8} />
        ) : trades.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No trades yet"
            description="Log your first trade to start tracking your behavioral patterns."
            action={
              <button
                onClick={onLogTrade}
                className="btn-primary text-[13px] py-2 px-4"
              >
                + Log Trade
              </button>
            }
          />
        ) : (
          <TradeTable trades={trades} onEdit={openEditDrawer} />
        )
      }

      {/* Pagination */}
      {pg && pg.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
            disabled={(filters.page ?? 1) <= 1}
            className="btn-ghost text-[13px] py-1.5 px-3 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[12px]" style={{ color: 'var(--text3)' }}>
            Page {pg.currentPage} of {pg.totalPages}
          </span>
          <button
            onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
            disabled={(filters.page ?? 1) >= pg.totalPages}
            className="btn-ghost text-[13px] py-1.5 px-3 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
