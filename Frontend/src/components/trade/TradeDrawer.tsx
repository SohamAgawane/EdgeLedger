import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getTradeApi } from '../../api/trades'
import { useCreateTrade, useUpdateTrade } from '../../hooks/useTrades'
import { EMOTION_OPTIONS, MISTAKE_OPTIONS, SECTOR_OPTIONS, Trade } from '../../types'
import Select from '../ui/Select'
import { fCurrency, labelMap } from '../../utils/formatters'

// ---------------------------------------------------------------------------
// Shape of a trade as returned by the API. Only the fields this form reads.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Validation
//
// Number inputs arrive from the DOM as strings (or '' when cleared). We
// deliberately do NOT use z.coerce.number() for these — Number('') is 0,
// so `.positive()` would reject an *empty* field with "must be greater
// than 0" instead of a proper "required" message. Converting '' to
// `undefined` ourselves, before the number schema ever sees it, avoids
// that entirely and lets required vs. optional behave correctly.
// ---------------------------------------------------------------------------
const toNumberOrUndefined = (value: unknown): number | undefined => {
  if (value === '' || value === null || value === undefined) return undefined
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(num) ? undefined : num
}

const emptyStringToUndefined = (value: unknown) => (value === '' ? undefined : value)

const tradeSchema = z
  .object({
    symbol: z
      .string()
      .trim()
      .min(1, 'Symbol required')
      .transform((v) => v.toUpperCase()),

    sector: z.string().min(1, 'Sector required'),

    buyPrice: z.preprocess(
      toNumberOrUndefined,
      z
        .number({ required_error: 'Buy price required', invalid_type_error: 'Buy price required' })
        .positive('Must be greater than 0'),
    ),

    quantity: z.preprocess(
      toNumberOrUndefined,
      z
        .number({ required_error: 'Quantity required', invalid_type_error: 'Quantity required' })
        .int('Must be a whole number')
        .positive('Must be greater than 0'),
    ),

    entryDate: z.string().min(1, 'Entry date required'),

    isOpen: z.boolean(),

    // Optional at the schema level — "required when closed" is enforced
    // below in superRefine, where we have access to `isOpen`.
    sellPrice: z.preprocess(toNumberOrUndefined, z.number().positive('Must be greater than 0').optional()),
    exitDate: z.preprocess(emptyStringToUndefined, z.string().optional()),

    emotionBefore: z.string().optional(),
    emotionAfter: z.string().optional(),
    mistakeCategory: z.string().optional(),

    convictionScore: z.preprocess(
      toNumberOrUndefined,
      z.number().min(1, 'Min 1').max(10, 'Max 10').optional(),
    ),

    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isOpen) return // open trades never require exit fields

    if (data.sellPrice === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sellPrice'], message: 'Sell price required' })
    }
    if (!data.exitDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['exitDate'], message: 'Exit date required' })
    }
  })

type Form = z.infer<typeof tradeSchema>

// buyPrice/quantity are required numbers in the schema, but the inputs need
// to render blank rather than "0" — so defaults are '' at runtime, cast past
// the stricter static type. Everything else has a real optional/empty value.
const DEFAULT_VALUES: Form = {
  symbol: '',
  sector: '',
  buyPrice: '' as unknown as number,
  quantity: '' as unknown as number,
  entryDate: '',
  isOpen: false,
  sellPrice: undefined,
  exitDate: undefined,
  emotionBefore: '',
  emotionAfter: '',
  mistakeCategory: '',
  convictionScore: undefined,
  notes: '',
}

const mapExistingToForm = (t: Trade): Form => ({
  symbol: t.symbol ?? '',
  sector: t.sector ?? '',
  buyPrice: (t.buyPrice ?? '') as unknown as number,
  quantity: (t.quantity ?? '') as unknown as number,
  entryDate: t.entryDate ? t.entryDate.slice(0, 10) : '',
  isOpen: !!t.isOpen,
  sellPrice: t.isOpen ? undefined : t.sellPrice ?? undefined,
  exitDate: t.isOpen ? undefined : t.exitDate ? t.exitDate.slice(0, 10) : undefined,
  emotionBefore: t.emotionBefore ?? '',
  emotionAfter: t.emotionAfter ?? '',
  mistakeCategory: t.mistakeCategory ?? '',
  convictionScore: t.convictionScore ?? undefined,
  notes: t.notes ?? '',
})

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="label">{label}</label>
    {children}
    {error && (
      <p className="text-[11px] mt-1" style={{ color: 'var(--loss)' }}>
        {error}
      </p>
    )}
  </div>
)

interface TradeDrawerProps {
  open: boolean
  onClose: () => void
  editId?: string
}

export default function TradeDrawer({ open, onClose, editId }: TradeDrawerProps) {
  const isEdit = !!editId
  const create = useCreateTrade()
  const update = useUpdateTrade()

  const { data: existing } = useQuery<Trade>({
    queryKey: ['trade', editId],
    queryFn: async () => {
      const { data } = await getTradeApi(editId!)
      return data.data
    },
    enabled: !!editId,
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(tradeSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const buyPrice = watch('buyPrice')
  const sellPrice = watch('sellPrice')
  const quantity = watch('quantity')
  const isOpen = watch('isOpen')

  // Fresh blank form every time the drawer opens for a *new* trade, and a
  // clean slate again once it closes — no leftover values from a previous
  // session bleeding into the next one.
  useEffect(() => {
    if (open && !editId) {
      reset(DEFAULT_VALUES)
    }
    if (!open) {
      reset(DEFAULT_VALUES)
    }
  }, [open, editId, reset])

  // Populate the form once the trade being edited has loaded.
  useEffect(() => {
    if (open && editId && existing) {
      reset(mapExistingToForm(existing))
    }
  }, [open, editId, existing, reset])

  // Marking a trade "still open" retires the exit fields immediately —
  // clear their values AND any error left over from before the toggle,
  // so nothing stale lingers once they're disabled.
  useEffect(() => {
    if (isOpen) {
      setValue('sellPrice', undefined)
      setValue('exitDate', undefined)
      clearErrors(['sellPrice', 'exitDate'])
    }
  }, [isOpen, setValue, clearErrors])

  const livePnl =
    !isOpen && Number.isFinite(Number(buyPrice)) && Number.isFinite(Number(sellPrice)) && Number.isFinite(Number(quantity))
      ? (Number(sellPrice) - Number(buyPrice)) * Number(quantity)
      : null

  const onSubmit = async (data: Form) => {
    const payload = {
      symbol: data.symbol,
      sector: data.sector,
      buyPrice: data.buyPrice,
      quantity: data.quantity,
      entryDate: data.entryDate,
      isOpen: data.isOpen,
      sellPrice: data.isOpen ? undefined : data.sellPrice,
      exitDate: data.isOpen ? undefined : data.exitDate,
      emotionBefore: data.emotionBefore || undefined,
      emotionAfter: data.emotionAfter || undefined,
      mistakeCategory: data.mistakeCategory || undefined,
      convictionScore: data.convictionScore,
      notes: data.notes || undefined,
    }

    if (isEdit) {
      await update.mutateAsync({ id: editId!, data: payload })
    } else {
      await create.mutateAsync(payload)
    }

    reset(DEFAULT_VALUES)
    onClose()
  }

  const sectorOpts = SECTOR_OPTIONS.map((s) => ({ value: s, label: s }))
  const emotionOpts = EMOTION_OPTIONS.map((e) => ({ value: e, label: e.charAt(0).toUpperCase() + e.slice(1) }))
  const mistakeOpts = MISTAKE_OPTIONS.map((m) => ({ value: m, label: labelMap[m] ?? m }))

  const isPending = create.isPending || update.isPending

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(6,9,22,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full z-50 overflow-y-auto"
            style={{
              width: 'min(520px, 100vw)',
              background: 'var(--card)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-24px 0 60px -20px rgba(0,0,0,0.35)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
              style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
            >
              <h2 className="text-[18px] font-bold" style={{ color: 'var(--text)' }}>
                {isEdit ? 'Edit trade' : 'Log a trade'}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg2)]"
                style={{ color: 'var(--text2)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
              {/* Trade Details */}
              <div>
                <p className="section-title mb-3">
                  Trade details
                </p>
                <div className="space-y-3">
                  <Field label="Symbol" error={errors.symbol?.message}>
                    <input className="input-base uppercase" placeholder="RELIANCE" {...register('symbol')} />
                  </Field>

                  <Field label="Sector" error={errors.sector?.message}>
                    <Controller
                      name="sector"
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={sectorOpts}
                          placeholder="Select sector"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      )}
                    />
                  </Field>

                  <div className="grid grid-cols-3 gap-2">
                    <Field label="Buy price" error={errors.buyPrice?.message}>
                      <input type="number" step="0.01" className="input-base" placeholder="0.00" {...register('buyPrice')} />
                    </Field>
                    <Field label="Sell price" error={errors.sellPrice?.message}>
                      <input
                        type="number"
                        step="0.01"
                        className="input-base disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="0.00"
                        disabled={isOpen}
                        {...register('sellPrice')}
                      />
                    </Field>
                    <Field label="Quantity" error={errors.quantity?.message}>
                      <input type="number" className="input-base" placeholder="1" {...register('quantity')} />
                    </Field>
                    <Field label="">
                      <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                        <input type="checkbox" className="w-4 h-4 accent-[var(--brand)]" {...register('isOpen')} />
                        <span className="text-[13.5px]" style={{ color: 'var(--text)' }}>Trade is still open</span>
                      </label>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Entry date" error={errors.entryDate?.message}>
                      <input type="date" className="input-base" {...register('entryDate')} />
                    </Field>
                    <Field label="Exit date" error={errors.exitDate?.message}>
                      <input
                        type="date"
                        className="input-base disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isOpen}
                        {...register('exitDate')}
                      />
                    </Field>
                  </div>

                  {/* Live P&L */}
                  <div
                    className="rounded-xl p-3.5 flex items-center justify-between"
                    style={{
                      background: isOpen || livePnl === null ? 'var(--bg2)' : livePnl >= 0 ? 'var(--profit-bg)' : 'var(--loss-bg)',
                      opacity: isOpen ? 0.6 : 1,
                    }}
                  >
                    <span className="text-[12px] font-semibold" style={{ color: 'var(--text2)' }}>
                      Estimated P&L
                    </span>
                    <span
                      className="mono font-bold text-[15px]"
                      style={{
                        color: isOpen || livePnl === null ? 'var(--text3)' : livePnl >= 0 ? 'var(--profit)' : 'var(--loss)',
                      }}
                    >
                      {isOpen ? 'Waiting for exit' : livePnl !== null ? `${livePnl >= 0 ? '+' : ''}${fCurrency(livePnl)}` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Psychology */}
              <div>
                <p className="section-title mb-3">
                  Psychology
                </p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Emotion before">
                      <Controller
                        name="emotionBefore"
                        control={control}
                        render={({ field }) => (
                          <Select
                            options={emotionOpts}
                            placeholder="How did you feel?"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        )}
                      />
                    </Field>
                    <Field label="Emotion after">
                      <Controller
                        name="emotionAfter"
                        control={control}
                        render={({ field }) => (
                          <Select
                            options={emotionOpts}
                            placeholder="How did you feel?"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        )}
                      />
                    </Field>
                  </div>

                  <Field label="Mistake category">
                    <Controller
                      name="mistakeCategory"
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={mistakeOpts}
                          placeholder="Any mistake?"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      )}
                    />
                  </Field>

                  <Field label="Conviction score (1–10)" error={errors.convictionScore?.message}>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="input-base"
                      placeholder="How sure were you, 1 to 10?"
                      {...register('convictionScore')}
                    />
                  </Field>
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="section-title mb-3">
                  Notes
                </p>
                <Field label="">
                  <textarea
                    className="input-base resize-none h-20"
                    placeholder="What was your thesis for this trade?"
                    {...register('notes')}
                  />
                </Field>
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="btn-primary flex-1">
                  {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Log Trade'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}