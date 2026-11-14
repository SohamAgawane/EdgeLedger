import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  accent?: string
  mono?: boolean
  index?: number
}

export default function KpiCard({ title, value, subtitle, icon: Icon, trend, trendValue, accent, mono, index = 0 }: Props) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'var(--profit)' : trend === 'down' ? 'var(--loss)' : 'var(--text3)'
  const ic = accent || 'var(--brand)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="card p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${ic} 14%, transparent)` }}>
          <Icon size={13} style={{ color: ic }} />
        </span>
        <p className="text-[12.5px] font-medium truncate" style={{ color: 'var(--text2)' }}>{title}</p>
      </div>
      <p className={`text-[24px] sm:text-[26px] font-semibold leading-none tracking-tight ${mono ? 'mono' : 'font-display'}`}
        style={{ color: 'var(--text)' }}>
        {value}
      </p>
      {(subtitle || trendValue) && (
        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-2.5">
          {trendValue && (
            <span className="flex items-center gap-1 text-[12px] font-medium num" style={{ color: trendColor }}>
              <TrendIcon size={12} />{trendValue}
            </span>
          )}
          {subtitle && <span className="text-[12px]" style={{ color: 'var(--text3)' }}>{subtitle}</span>}
        </div>
      )}
    </motion.div>
  )
}
