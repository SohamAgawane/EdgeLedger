import { format, parseISO, differenceInDays } from 'date-fns'

export const fCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export const fNumber = (n: number, decimals = 2) => n.toFixed(decimals)

export const fPercent = (n: number) => `${n.toFixed(1)}%`

export const fDate = (d: string) => {
  try { return format(parseISO(d), 'dd MMM yyyy') } catch { return d }
}

export const fDateShort = (d: string) => {
  try { return format(parseISO(d), 'dd MMM') } catch { return d }
}

export const fDays = (n: number) => `${n.toFixed(1)}d`

export const holdingDays = (entry: string, exit?: string) => {
  if (!exit) return '-'
  return differenceInDays(parseISO(exit), parseISO(entry)) + 'd'
}

export const pnlColor = (n: number) => n >= 0 ? 'var(--profit)' : 'var(--loss)'

export const labelMap: Record<string, string> = {
  overtrading: 'Overtrading', revenge_trade: 'Revenge trade', no_stop_loss: 'No stop-loss',
  fomo_entry: 'FOMO entry', ignored_plan: 'Ignored plan', oversized_position: 'Oversized position',
  early_exit: 'Early exit', late_exit: 'Late exit', chasing_news: 'Chasing news', none: 'None',
  confident: 'Confident', fearful: 'Fearful', greedy: 'Greedy', fomo: 'FOMO',
  calm: 'Calm', anxious: 'Anxious', neutral: 'Neutral', revenge: 'Revenge',
}

// One hue per emotion. Backgrounds are derived with color-mix so they work in light and dark themes.
export const emotionColor: Record<string, string> = {
  confident: '#12A67A', calm: '#2E8FD0', neutral: '#8A90A6', fearful: '#6C7BE8',
  anxious: '#B65FCF', greedy: '#D9A21B', fomo: '#E8590C', revenge: '#DC3F5B',
}

export const fCompact = (n: number) => {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`
  if (abs >= 100000)   return `${sign}₹${(abs / 100000).toFixed(1)}L`
  if (abs >= 1000)     return `${sign}₹${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
  return `${sign}₹${abs.toFixed(0)}`
}
