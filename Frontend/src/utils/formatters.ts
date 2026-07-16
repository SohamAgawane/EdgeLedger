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
  overtrading: 'Overtrading', revenge_trade: 'Revenge Trade', no_stop_loss: 'No Stoploss',
  fomo_entry: 'FOMO Entry', ignored_plan: 'Ignored Plan', oversized_position: 'Oversized Pos.',
  early_exit: 'Early Exit', late_exit: 'Late Exit', chasing_news: 'Chasing News', none: 'None',
  confident: 'Confident', fearful: 'Fearful', greedy: 'Greedy', fomo: 'FOMO',
  calm: 'Calm', anxious: 'Anxious', neutral: 'Neutral', revenge: 'Revenge',
}

export const emotionColor: Record<string, { bg: string; text: string }> = {
  confident: { bg: '#EEF7EE', text: '#3D7A3D' }, fearful: { bg: '#F0EEFB', text: '#5E4FA0' },
  greedy:    { bg: '#FEF5E8', text: '#9A6200' }, fomo:    { bg: '#FEF0E8', text: '#A05020' },
  calm:      { bg: '#EEF5FB', text: '#2E6A9A' }, anxious: { bg: '#FBF0EE', text: '#A03020' },
  neutral:   { bg: '#F3F2EF', text: '#78716C' }, revenge: { bg: '#FEEEEE', text: '#A03030' },
}
