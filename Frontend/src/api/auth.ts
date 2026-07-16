import api from './axiosInstance'
import type { ApiResponse, User } from '../types'

export interface LoginPayload   { email?: string; username?: string; password: string }
export interface RegisterPayload { username: string; email: string; fullName: string; password: string }

interface AuthData { user: User; accessToken: string; refreshToken: string }

export const loginApi    = (p: LoginPayload)    => api.post<ApiResponse<AuthData>>('/auth/login', p)
export const registerApi = (p: RegisterPayload) => api.post<ApiResponse<{ user: User }>>('/auth/register', p)
export const logoutApi   = ()                   => api.post('/auth/logout')
