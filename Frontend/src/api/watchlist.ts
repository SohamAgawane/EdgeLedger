import api from './axiosInstance'
import type { ApiResponse, WatchlistItem } from '../types'

export const getWatchlistApi    = (tag?: string) => api.get<ApiResponse<WatchlistItem[]>>('/watchlist', { params: tag ? { tag } : {} })
export const addWatchlistApi    = (d: { symbol: string; tags: string[]; notes: string }) => api.post<ApiResponse<WatchlistItem>>('/watchlist', d)
export const updateWatchlistApi = (id: string, d: Partial<{ tags: string[]; notes: string }>) => api.patch<ApiResponse<WatchlistItem>>(`/watchlist/${id}`, d)
export const removeWatchlistApi = (id: string) => api.delete<ApiResponse<{ deleted: boolean }>>(`/watchlist/${id}`)
