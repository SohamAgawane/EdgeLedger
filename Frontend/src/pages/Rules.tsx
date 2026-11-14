import { useState } from 'react'
import { ShieldCheck, Plus, Trash2, Clock, BarChart2, RefreshCw, Percent } from 'lucide-react'
import { useRules, useCreateRule, useToggleRule, useDeleteRule } from '../hooks/useRules'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { CardSkeleton } from '../components/ui/Skeleton'
import type { Rule, RuleType } from '../types'

const RULE_META: Record<RuleType, { label: string; icon: typeof ShieldCheck; desc: string; placeholder: string; inputType: string }> = {
  max_capital_percent: { label: 'Max capital per trade', icon: Percent,   desc: 'Warn when one trade uses more than this % of your account capital', placeholder: 'e.g. 5',  inputType: 'number' },
  max_trades_per_day:  { label: 'Max trades per day',    icon: BarChart2, desc: 'Warn when you log more trades than this in a day',               placeholder: 'e.g. 3',  inputType: 'number' },
  no_trade_after_time: { label: 'Trading cutoff time',   icon: Clock,     desc: 'Warn when a trade is entered after this time',                    placeholder: '15:30',   inputType: 'time' },
  no_revenge_trade:    { label: 'No revenge trades',     icon: RefreshCw, desc: 'Warn when you trade within 30 minutes of a loss',                 placeholder: '',        inputType: 'toggle' },
}

function RuleCard({ rule }: { rule: Rule }) {
  const toggle = useToggleRule()
  const del = useDeleteRule()
  const meta = RULE_META[rule.type]

  return (
    <div className="card p-4 sm:p-5 flex items-center gap-4" style={{ opacity: rule.isActive ? 1 : 0.7 }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: rule.isActive ? 'var(--brand-bg)' : 'var(--bg2)' }}>
        <meta.icon size={19} style={{ color: rule.isActive ? 'var(--brand)' : 'var(--text3)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
          {meta.label}
          {meta.inputType !== 'toggle' && (
            <span className="mono ml-2 text-[13px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: 'var(--bg2)', color: 'var(--text)' }}>
              {String(rule.value)}{rule.type === 'max_capital_percent' ? '%' : ''}
            </span>
          )}
        </p>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--text3)' }}>{meta.desc}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button role="switch" aria-checked={rule.isActive} aria-label={`${meta.label} is ${rule.isActive ? 'on' : 'off'}`}
          onClick={() => toggle.mutate(rule._id)}
          className="w-11 h-6 rounded-full relative transition-colors" style={{ background: rule.isActive ? 'var(--brand)' : 'var(--border2)' }}>
          <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-sm transition-transform duration-200"
            style={{ background: '#fff', transform: rule.isActive ? 'translateX(20px)' : 'translateX(0)' }} />
        </button>
        <button onClick={() => del.mutate(rule._id)} aria-label={`Delete ${meta.label}`}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--loss-bg)]" style={{ color: 'var(--loss)' }}>
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

export default function Rules() {
  const { data: rules, isLoading } = useRules()
  const { mutate: create, isPending } = useCreateRule()
  const existingTypes = new Set(rules?.map((r) => r.type) ?? [])
  const available = (Object.keys(RULE_META) as RuleType[]).filter((k) => !existingTypes.has(k))
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<RuleType>('max_capital_percent')
  const [value, setValue] = useState('')

  const openModal = () => { if (available.length) setType(available[0]); setValue(''); setOpen(true) }

  const handleCreate = () => {
    const v = type === 'no_revenge_trade' ? true : RULE_META[type].inputType === 'number' ? Number(value) : value
    create({ type, value: v as any }, { onSuccess: () => { setOpen(false); setValue('') } })
  }

  const needsValue = RULE_META[type].inputType !== 'toggle'

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <p className="text-[14px] max-w-[520px] leading-relaxed" style={{ color: 'var(--text2)' }}>
          Rules are checked each time you log a trade. A broken rule shows you a warning. It never blocks the trade.
        </p>
        <button onClick={openModal} disabled={!available.length && !!rules?.length} className="btn-primary text-[13.5px] !py-2.5"><Plus size={15} /> Add rule</button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : !rules?.length ? (
        <EmptyState icon={ShieldCheck} title="No rules yet"
          description="Write down the limits you want to keep, like a daily trade cap or a cutoff time. You will get a warning when you cross one."
          action={<button className="btn-primary" onClick={openModal}><Plus size={16} /> Add your first rule</button>} />
      ) : (
        <div className="space-y-3">{rules.map((r) => <RuleCard key={r._id} rule={r} />)}</div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add a trading rule">
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="rule-type">Rule</label>
            <select id="rule-type" className="input-base" value={type} onChange={(e) => { setType(e.target.value as RuleType); setValue('') }}>
              {(Object.keys(RULE_META) as RuleType[]).map((k) => (
                <option key={k} value={k} disabled={existingTypes.has(k)}>{RULE_META[k].label}{existingTypes.has(k) ? ' (already set)' : ''}</option>
              ))}
            </select>
          </div>
          <div className="card2 p-3.5"><p className="text-[13px] leading-relaxed" style={{ color: 'var(--text2)' }}>{RULE_META[type].desc}.</p></div>
          {needsValue && (
            <div>
              <label className="label" htmlFor="rule-value">Limit</label>
              <input id="rule-value" className="input-base" type={RULE_META[type].inputType} placeholder={RULE_META[type].placeholder} value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button className="btn-ghost flex-1" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={handleCreate} disabled={isPending || existingTypes.has(type) || (needsValue && !value)}>
              {isPending ? 'Adding…' : 'Add rule'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
