import { Pencil, Trash2 } from 'lucide-react'
import { fDate, fCurrency, labelMap } from '../../utils/formatters'
import type { Trade } from '../../types'
import PnlBadge from './PnlBadge'
import EmotionPill from './EmotionPill'
import ConvictionDots from './ConvictionDots'
import Badge from '../ui/Badge'
import { useDeleteTrade } from '../../hooks/useTrades'

interface Props { trades: Trade[]; onEdit: (id: string) => void }

const th = 'px-4 py-3 text-left text-[12px] font-medium whitespace-nowrap'

export default function TradeTable({ trades, onEdit }: Props) {
  const { mutate: del } = useDeleteTrade()

  if (!trades.length) return (
    <div className="panel py-16 text-center">
      <p style={{ color: 'var(--text2)' }} className="text-[14px]">No trades match these filters.</p>
    </div>
  )

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
              {['Symbol', 'Entry', 'Exit', 'Buy', 'Sell', 'Qty', 'P&L', 'Emotion', 'Mistake', 'Conviction', ''].map((h, i) => (
                <th key={i} className={th} style={{ color: 'var(--text3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t._id} className="group transition-colors hover:bg-[var(--bg2)]" style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold mono text-[13px]" style={{ color: 'var(--text)' }}>{t.symbol}</span>
                    <Badge variant="brand" className="w-fit">{t.sector}</Badge>
                  </div>
                </td>
                <td className="px-4 py-3 mono text-[12px] whitespace-nowrap" style={{ color: 'var(--text2)' }}>{fDate(t.entryDate)}</td>
                <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ color: 'var(--text2)' }}>
                  {t.isOpen ? <Badge variant="warn">Open</Badge> : t.exitDate ? <span className="mono">{fDate(t.exitDate)}</span> : '—'}
                </td>
                <td className="px-4 py-3 mono" style={{ color: 'var(--text2)' }}>{fCurrency(t.buyPrice)}</td>
                <td className="px-4 py-3 mono" style={{ color: 'var(--text2)' }}>{t.isOpen ? '—' : fCurrency(t.sellPrice)}</td>
                <td className="px-4 py-3 mono" style={{ color: 'var(--text2)' }}>{t.quantity}</td>
                <td className="px-4 py-3">{t.isOpen ? <span style={{ color: 'var(--text3)' }}>—</span> : <PnlBadge pnl={t.pnl} />}</td>
                <td className="px-4 py-3">{t.emotionBefore ? <EmotionPill emotion={t.emotionBefore} /> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                <td className="px-4 py-3">
                  {t.mistakeCategory && t.mistakeCategory !== 'none'
                    ? <Badge variant="warn">{labelMap[t.mistakeCategory] ?? t.mistakeCategory}</Badge>
                    : <span style={{ color: 'var(--text3)' }}>—</span>}
                </td>
                <td className="px-4 py-3"><ConvictionDots score={t.convictionScore} /></td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(t._id)} aria-label={`Edit ${t.symbol}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--brand-bg)]"
                      style={{ color: 'var(--brand)' }}><Pencil size={13} /></button>
                    <button onClick={() => { if (window.confirm(`Delete ${t.symbol} trade?`)) del(t._id) }} aria-label={`Delete ${t.symbol}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--loss-bg)]"
                      style={{ color: 'var(--loss)' }}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
