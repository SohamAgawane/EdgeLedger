import { useState } from 'react'
import { Shield, Plus, Trash2, Clock, BarChart2, RefreshCw, DollarSign } from 'lucide-react'
import { useRules, useCreateRule, useToggleRule, useDeleteRule } from '../hooks/useRules'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { CardSkeleton } from '../components/ui/Skeleton'
import type { Rule, RuleType } from '../types'

const RULE_META: Record<RuleType, { label: string; icon: typeof Shield; desc: string; placeholder: string; inputType: string }> = {
  max_capital_percent: { label: 'Max Capital %', icon: DollarSign, desc: 'Maximum % of account capital per trade', placeholder: 'e.g. 5', inputType: 'number' },
  max_trades_per_day: { label: 'Max Trades/Day', icon: BarChart2, desc: 'Maximum number of trades per day', placeholder: 'e.g. 3', inputType: 'number' },
  no_trade_after_time: { label: 'Time Cutoff', icon: Clock, desc: 'No trading after this time', placeholder: '15:30', inputType: 'time' },
  no_revenge_trade: { label: 'No Revenge Trade', icon: RefreshCw, desc: 'Warn if trading within 30 min of a loss', placeholder: 'Toggle on', inputType: 'toggle' },
}

function RuleCard({ rule }: { rule: Rule }) {
  const toggle = useToggleRule()
  const del = useDeleteRule()
  const meta = RULE_META[rule.type]

  return (
    <div className="card p-4 flex items-center justify-between gap-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: rule.isActive ? 'var(--brand-bg)' : 'var(--bg2)' }}>
        <meta.icon size={16} style={{ color: rule.isActive ? 'var(--brand)' : 'var(--text3)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{meta.label}</p>
        <p className="text-[12px]" style={{ color: 'var(--text3)' }}>
          {meta.desc} — <span className="mono font-medium" style={{ color: 'var(--text2)' }}>
            {meta.inputType === 'toggle' ? 'Enabled' : String(rule.value)}
            {rule.type === 'max_capital_percent' ? '%' : ''}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => toggle.mutate(rule._id)}
          className="w-10 h-6 rounded-full relative transition-colors"
          style={{ background: rule.isActive ? 'var(--brand)' : 'var(--border2)' }}
        >
          <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
            style={{ left: rule.isActive ? '50%' : '2px', transform: rule.isActive ? 'translateX(-2px)' : 'none' }} />
        </button>
        <button onClick={() => del.mutate(rule._id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70"
          style={{ background: 'var(--loss-bg)', color: 'var(--loss)' }}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export default function Rules() {
  const { data: rules, isLoading } = useRules()
  const { mutate: create, isPending } = useCreateRule()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<RuleType>('max_capital_percent')
  const [value, setValue] = useState('')

  const handleCreate = () => {
    const v = type === 'no_revenge_trade' ? true : RULE_META[type].inputType === 'number' ? Number(value) : value
    create({ type, value: v as any }, { onSuccess: () => { setOpen(false); setValue('') } })
  }

  const existingTypes = new Set(rules?.map((r) => r.type) ?? [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>Trading Rules</h2>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text3)' }}>
            Rules are checked on every trade. Violations return warnings, not rejections.
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary text-[13px]">
          <Plus size={14} /> Add Rule
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : !rules?.length ? (
        <EmptyState
          icon={Shield}
          title="No rules set"
          description="Define personal trading rules to stay disciplined."
          action={
            <button
              className="btn-primary text-[13px]"
              onClick={() => setOpen(true)}
            >
              Add Rule
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {rules.map((r) => <RuleCard key={r._id} rule={r} />)}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Trading Rule">
        <div className="space-y-4">
          <div>
            <label className="label">Rule Type</label>
            <select className="input-base"
              value={type} onChange={(e) => { setType(e.target.value as RuleType); setValue('') }}>
              {(Object.keys(RULE_META) as RuleType[]).map((k) => (
                <option key={k} value={k} disabled={existingTypes.has(k)}>
                  {RULE_META[k].label} {existingTypes.has(k) ? '(already set)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="card2 p-3">
            <p className="text-[12px]" style={{ color: 'var(--text2)' }}>{RULE_META[type].desc}</p>
          </div>

          {RULE_META[type].inputType !== 'toggle' && (
            <div>
              <label className="label">Value</label>
              <input
                className="input-base"
                type={RULE_META[type].inputType}
                placeholder={RULE_META[type].placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button className="btn-ghost flex-1" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={handleCreate} disabled={isPending}>
              {isPending ? 'Creating…' : 'Create Rule'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
