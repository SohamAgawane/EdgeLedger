
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: 'https://edgeledger-pbpk.onrender.com/api/v1',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const rt = useAuthStore.getState().refreshToken

        const { data } = await api.post('/auth/refresh-token', {
          refreshToken: rt,
        })

        useAuthStore.getState().setAuth(
          useAuthStore.getState().user!,
          data.data.accessToken,
          data.data.refreshToken
        )

        original.headers.Authorization = `Bearer ${data.data.accessToken}`

        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(err)
  }
)

export default api
