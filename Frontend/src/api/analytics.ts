import api from './axiosInstance'
import type { ApiResponse, DashboardData } from '../types'

export const getDashboardApi = () => api.get<ApiResponse<DashboardData>>('/analytics/dashboard')
