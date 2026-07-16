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

export default function KpiCard({
  title, value, subtitle, icon: Icon,
  trend, trendValue, accent, mono, index = 0
}: Props) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'var(--profit)' : trend === 'down' ? 'var(--loss)' : 'var(--text3)'
  const ic = accent || 'var(--brand)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[12px] font-semibold tracking-wide uppercase" style={{ color: 'var(--text3)' }}>
          {title}
        </p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${ic} 12%, transparent)` }}>
          <Icon size={15} style={{ color: ic }} />
        </div>
      </div>
      <p className={`text-[22px] font-bold leading-none mb-1 ${mono ? 'mono' : ''}`}
        style={{ color: 'var(--text)' }}>
        {value}
      </p>
      {(subtitle || trendValue) && (
        <div className="flex items-center gap-2 mt-2">
          {trendValue && (
            <span className="flex items-center gap-1 text-[11.5px] font-medium" style={{ color: trendColor }}>
              <TrendIcon size={12} />
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span className="text-[11.5px]" style={{ color: 'var(--text3)' }}>{subtitle}</span>
          )}
        </div>
      )}
    </motion.div>
  )
}
