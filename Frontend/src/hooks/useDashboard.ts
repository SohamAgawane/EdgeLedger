import { useQuery } from '@tanstack/react-query'
import { getDashboardApi } from '../api/analytics'

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await getDashboardApi()
      return data.data
    },
    staleTime: 5 * 60 * 1000,
  })
