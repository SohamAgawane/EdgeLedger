export interface User {
  _id: string
  username: string
  email: string
  fullName: string
  accountCapital: number
  createdAt: string
  updatedAt: string
}

export interface Trade {
  _id: string
  owner: string
  symbol: string
  buyPrice: number
  sellPrice: number
  quantity: number
  entryDate: string
  exitDate?: string
  sector: string
  emotionBefore?: string
  emotionAfter?: string
  mistakeCategory?: string
  convictionScore?: number
  notes?: string
  pnl: number
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  totalCount: number
  totalPages: number
  currentPage: number
  limit: number
}

export interface TradesResponse {
  trades: Trade[]
  pagination: Pagination
}

export interface WatchlistItem {
  _id: string
  owner: string
  symbol: string
  tags: string[]
  notes: string
  createdAt: string
}

export type RuleType =
  | 'max_capital_percent'
  | 'max_trades_per_day'
  | 'no_trade_after_time'
  | 'no_revenge_trade'

export interface Rule {
  _id: string
  owner: string
  type: RuleType
  value: number | string | boolean
  isActive: boolean
  createdAt: string
}

export interface WinRate {
  totalTrades: number
  winningTrades: number
  winRate: number
}

export interface AvgPnl {
  avgPnl: number
  totalPnl: number
}

export interface SectorPerf {
  sector: string
  avgPnl: number
  totalPnl: number
  tradeCount: number
}

export interface WeekdayPerf {
  day: string
  avgPnl: number
  tradeCount: number
}

export interface HoldingPeriod {
  avgHoldingDays: number
}

export interface MistakeDist {
  mistake: string
  count: number
}

export interface ConvictionItem {
  convictionScore: number
  avgPnl: number
  tradeCount: number
}

export interface RiskItem {
  sector: string
  totalCapital: number
  percentage: number
  isOverConcentrated: boolean
}

export interface DashboardData {
  winRate: WinRate
  avgPnl: AvgPnl
  sectorPerformance: SectorPerf[]
  weekdayPerformance: WeekdayPerf[]
  avgHoldingPeriod: HoldingPeriod
  mistakeDistribution: MistakeDist[]
  convictionVsProfit: ConvictionItem[]
  riskConcentration: RiskItem[]
}

export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  data: T
  message: string
}

export const EMOTION_OPTIONS = [
  'confident','fearful','greedy','fomo','calm','anxious','neutral','revenge'
] as const

export const MISTAKE_OPTIONS = [
  'overtrading','revenge_trade','no_stop_loss','fomo_entry',
  'ignored_plan','oversized_position','early_exit','late_exit',
  'chasing_news','none'
] as const

export const SECTOR_OPTIONS = [
  'IT','Banking','Energy','Auto','Pharma','Finance',
  'Infrastructure','FMCG','Metals','Real Estate','Other'
] as const

export type Emotion = typeof EMOTION_OPTIONS[number]
export type Mistake = typeof MISTAKE_OPTIONS[number]
