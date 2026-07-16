import api from './axiosInstance'
import type { ApiResponse, Rule, RuleType } from '../types'

export const getRulesApi    = () => api.get<ApiResponse<Rule[]>>('/rules')
export const createRuleApi  = (d: { type: RuleType; value: number | string | boolean }) => api.post<ApiResponse<Rule>>('/rules', d)
export const updateRuleApi  = (id: string, d: Partial<{ value: number | string | boolean; isActive: boolean }>) => api.patch<ApiResponse<Rule>>(`/rules/${id}`, d)
export const toggleRuleApi  = (id: string) => api.patch<ApiResponse<Rule>>(`/rules/${id}/toggle`)
export const deleteRuleApi  = (id: string) => api.delete<ApiResponse<{ deleted: boolean }>>(`/rules/${id}`)
