import { cn } from '../../utils/cn'

type Variant = 'profit' | 'loss' | 'warn' | 'brand' | 'neutral'

const styles: Record<Variant, { bg: string; color: string }> = {
  profit:  { bg: 'var(--profit-bg)',  color: 'var(--profit)' },
  loss:    { bg: 'var(--loss-bg)',    color: 'var(--loss)'   },
  warn:    { bg: 'var(--warn-bg)',    color: 'var(--warn)'   },
  brand:   { bg: 'var(--brand-bg)',   color: 'var(--brand)'  },
  neutral: { bg: 'var(--bg2)',        color: 'var(--text2)'  },
}

export default function Badge({ children, variant = 'neutral', className }: {
  children: React.ReactNode; variant?: Variant; className?: string
}) {
  const s = styles[variant]
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold', className)}
      style={{ background: s.bg, color: s.color }}
    >
      {children}
    </span>
  )
}
