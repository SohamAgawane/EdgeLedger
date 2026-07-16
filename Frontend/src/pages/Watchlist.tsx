import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Bookmark, X, Plus } from 'lucide-react'
import { useWatchlist, useAddWatchlist, useRemoveWatchlist } from '../hooks/useWatchlist'
import EmptyState from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'
import { fDate } from '../utils/formatters'
import { SECTOR_OPTIONS } from '../types'

export default function Watchlist() {
  const [tag, setTag] = useState<string>()
  const { data: items, isLoading } = useWatchlist(tag)
  const { mutate: add, isPending: adding } = useAddWatchlist()
  const { mutate: remove } = useRemoveWatchlist()
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const { register, handleSubmit, reset } = useForm<{ symbol: string; notes: string }>()

  const addTag = (t: string) => { if (t && !tags.includes(t)) setTags([...tags, t]); setTagInput('') }
  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t))

  const onSubmit = (d: { symbol: string; notes: string }) => {
    add({ symbol: d.symbol, tags, notes: d.notes })
    reset(); setTags([])
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>Watchlist</h2>
          <p className="text-[12px]" style={{ color: 'var(--text3)' }}>{items?.length ?? 0} symbols</p>
        </div>

        {isLoading ? <TableSkeleton rows={4} /> :
          !items?.length ? (
            <EmptyState icon={Bookmark} title="Empty watchlist" description="Add symbols you're tracking for future trade ideas." />
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item._id} className="card p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold mono text-[14px]" style={{ color: 'var(--text)' }}>{item.symbol}</span>
                      {item.tags.map((t) => (
                        <span key={t} className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}>{t}</span>
                      ))}
                    </div>
                    {item.notes && <p className="text-[12px]" style={{ color: 'var(--text2)' }}>{item.notes}</p>}
                    <p className="text-[11px] mt-1" style={{ color: 'var(--text3)' }}>Added {fDate(item.createdAt)}</p>
                  </div>
                  <button onClick={() => remove(item._id)} className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70"
                    style={{ background: 'var(--loss-bg)', color: 'var(--loss)' }}>
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* Add form */}
      <div className="card p-5 h-fit">
        <p className="text-[13px] font-bold mb-4" style={{ color: 'var(--text)' }}>Add Symbol</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="label">Symbol</label>
            <input className="input-base uppercase" placeholder="e.g. TATAMOTORS" {...register('symbol', { required: true })} />
          </div>
          <div>
            <label className="label">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}>
                  {t} <button type="button" onClick={() => removeTag(t)}><X size={9} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input-base text-[13px]" placeholder="Add tag + enter" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
              />
              <button type="button" onClick={() => addTag(tagInput)} className="btn-ghost py-2 px-3 shrink-0">
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input-base resize-none h-20 text-[13px]" placeholder="Why are you watching this?" {...register('notes')} />
          </div>
          <button type="submit" disabled={adding} className="btn-primary w-full text-[13px]">
            {adding ? 'Adding…' : 'Add to Watchlist'}
          </button>
        </form>
      </div>
    </div>
  )
}
