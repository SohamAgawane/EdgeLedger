import api from './axiosInstance'
import type { ApiResponse, Trade, TradesResponse } from '../types'

export interface TradeFilters {
  sector?: string; mistakeCategory?: string; from?: string
  to?: string; minPnl?: string; maxPnl?: string; page?: number; limit?: number
}

export interface CreateTradePayload {
  symbol: string;
  buyPrice: number;
  sellPrice?: number;
  quantity: number
  entryDate: string; 
  exitDate?: string; 
  sector: string; 
  emotionBefore?: string
  emotionAfter?: string; 
  mistakeCategory?: string; 
  convictionScore?: number; 
  notes?: string
}

export const getTradesApi = (p: TradeFilters) => api.get<ApiResponse<TradesResponse>>('/trades', { params: p })
export const getTradeApi = (id: string) => api.get<ApiResponse<Trade>>(`/trades/${id}`)
export const createTradeApi = (d: CreateTradePayload) => api.post<ApiResponse<{ trade: Trade; warnings: string[] }>>('/trades', d)
export const updateTradeApi = (id: string, d: Partial<CreateTradePayload>) => api.patch<ApiResponse<Trade>>(`/trades/${id}`, d)
export const deleteTradeApi = (id: string) => api.delete<ApiResponse<{ deleted: boolean }>>(`/trades/${id}`)
export const importCsvApi = (file: File) => {
  const fd = new FormData(); fd.append('file', file)
  return api.post<ApiResponse<{ totalRows: number; imported: number; failed: number; errors: { row: number; reason: string }[] }>>('/trades/import-csv', fd)
}
