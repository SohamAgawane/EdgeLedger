import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Bookmark, X, Plus } from 'lucide-react'
import { useWatchlist, useAddWatchlist, useRemoveWatchlist } from '../hooks/useWatchlist'
import EmptyState from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'
import { fDate } from '../utils/formatters'

export default function Watchlist() {
  const [tag] = useState<string>()
  const { data: items, isLoading } = useWatchlist(tag)
  const { mutate: add, isPending: adding } = useAddWatchlist()
  const { mutate: remove } = useRemoveWatchlist()
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const { register, handleSubmit, reset } = useForm<{ symbol: string; notes: string }>()

  const addTag = (t: string) => { const v = t.trim(); if (v && !tags.includes(v)) setTags([...tags, v]); setTagInput('') }
  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t))

  const onSubmit = (d: { symbol: string; notes: string }) => {
    add({ symbol: d.symbol.toUpperCase(), tags, notes: d.notes })
    reset(); setTags([])
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
      <div className="space-y-3">
        <p className="text-[14px]" style={{ color: 'var(--text2)' }}>
          <span className="font-semibold" style={{ color: 'var(--text)' }}>{items?.length ?? 0}</span> symbols you are watching
        </p>

        {isLoading ? <TableSkeleton rows={4} /> :
          !items?.length ? (
            <EmptyState icon={Bookmark} title="Nothing on your watchlist"
              description="Add a symbol with the reason you are watching it. Future you will want the context." />
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item._id} className="card p-4 sm:p-5 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-semibold mono text-[15px]" style={{ color: 'var(--text)' }}>{item.symbol}</span>
                      {item.tags.map((t) => (
                        <span key={t} className="text-[11.5px] font-medium px-2 py-0.5 rounded-md" style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}>{t}</span>
                      ))}
                    </div>
                    {item.notes && <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--text2)' }}>{item.notes}</p>}
                    <p className="text-[12px] mt-2" style={{ color: 'var(--text3)' }}>Added {fDate(item.createdAt)}</p>
                  </div>
                  <button onClick={() => remove(item._id)} aria-label={`Remove ${item.symbol}`}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--loss-bg)]" style={{ color: 'var(--loss)' }}>
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
      </div>

      <div className="card p-5 sm:p-6 lg:sticky lg:top-0">
        <p className="section-title mb-4">Add a symbol</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label" htmlFor="wl-symbol">Symbol</label>
            <input id="wl-symbol" className="input-base uppercase" placeholder="TATAMOTORS" {...register('symbol', { required: true })} />
          </div>
          <div>
            <label className="label" htmlFor="wl-tag">Tags</label>
            {tags.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 text-[12px] font-medium pl-2 pr-1 py-0.5 rounded-md" style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}>
                    {t} <button type="button" onClick={() => removeTag(t)} aria-label={`Remove tag ${t}`} className="p-0.5"><X size={11} /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input id="wl-tag" className="input-base" placeholder="Type a tag, press Enter" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }} />
              <button type="button" onClick={() => addTag(tagInput)} aria-label="Add tag" className="btn-ghost !px-3 shrink-0"><Plus size={16} /></button>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="wl-notes">Why are you watching it?</label>
            <textarea id="wl-notes" className="input-base resize-none h-24" placeholder="Entry level, catalyst, what would change your mind…" {...register('notes')} />
          </div>
          <button type="submit" disabled={adding} className="btn-primary w-full">{adding ? 'Adding…' : 'Add to watchlist'}</button>
        </form>
      </div>
    </div>
  )
}
