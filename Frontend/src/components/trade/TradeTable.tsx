import { Pencil, Trash2 } from 'lucide-react'
import { fDate, fCurrency, holdingDays, labelMap } from '../../utils/formatters'
import type { Trade } from '../../types'
import PnlBadge from './PnlBadge'
import EmotionPill from './EmotionPill'
import ConvictionDots from './ConvictionDots'
import Badge from '../ui/Badge'
import { useDeleteTrade } from '../../hooks/useTrades'

interface Props {
  trades: Trade[]
  onEdit: (id: string) => void
}

const col = 'px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide'

export default function TradeTable({ trades, onEdit }: Props) {
  const { mutate: del } = useDeleteTrade()

  if (!trades.length) return (
    <div className="card py-16 text-center">
      <p style={{ color: 'var(--text3)' }} className="text-[14px]">No trades match your filters.</p>
    </div>
  )

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Symbol','Sector','Entry','Exit','Buy','Sell','Qty','P&L','Emotion','Mistake','Conviction',''].map((h) => (
              <th key={h} className={col} style={{ color: 'var(--text3)', background: 'var(--bg2)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map((t, i) => (
            <tr
              key={t._id}
              style={{
                borderBottom: '1px solid var(--border)',
                background: i % 2 === 0 ? 'var(--card)' : 'var(--bg)',
              }}
              className="group hover:opacity-90 transition-opacity"
            >
              <td className="px-4 py-3 font-bold mono text-[13px]" style={{ color: 'var(--text)' }}>
                {t.symbol}
              </td>
              <td className="px-4 py-3">
                <Badge variant="brand">{t.sector}</Badge>
              </td>
              <td className="px-4 py-3 mono text-[12px]" style={{ color: 'var(--text2)' }}>{fDate(t.entryDate)}</td>
              <td className="px-4 py-3 mono text-[12px]" style={{ color: 'var(--text2)' }}>
                {t.exitDate ? fDate(t.exitDate) : '—'}
              </td>
              <td className="px-4 py-3 mono" style={{ color: 'var(--text2)' }}>{fCurrency(t.buyPrice)}</td>
              <td className="px-4 py-3 mono" style={{ color: 'var(--text2)' }}>{fCurrency(t.sellPrice)}</td>
              <td className="px-4 py-3 mono" style={{ color: 'var(--text2)' }}>{t.quantity}</td>
              <td className="px-4 py-3"><PnlBadge pnl={t.pnl} /></td>
              <td className="px-4 py-3">
                {t.emotionBefore ? <EmotionPill emotion={t.emotionBefore} /> : '—'}
              </td>
              <td className="px-4 py-3">
                {t.mistakeCategory && t.mistakeCategory !== 'none'
                  ? <Badge variant="warn">{labelMap[t.mistakeCategory] ?? t.mistakeCategory}</Badge>
                  : <span style={{ color: 'var(--text3)' }}>—</span>
                }
              </td>
              <td className="px-4 py-3"><ConvictionDots score={t.convictionScore} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(t._id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70"
                    style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => del(t._id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70"
                    style={{ background: 'var(--loss-bg)', color: 'var(--loss)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
