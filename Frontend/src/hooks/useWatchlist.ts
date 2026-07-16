import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWatchlistApi, addWatchlistApi, updateWatchlistApi, removeWatchlistApi } from '../api/watchlist'
import toast from 'react-hot-toast'

export const useWatchlist = (tag?: string) =>
  useQuery({ queryKey: ['watchlist', tag], queryFn: async () => { const { data } = await getWatchlistApi(tag); return data.data } })

export const useAddWatchlist = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addWatchlistApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['watchlist'] }); toast.success('Symbol added') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export const useUpdateWatchlist = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ tags: string[]; notes: string }> }) => updateWatchlistApi(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['watchlist'] }); toast.success('Updated') },
  })
}

export const useRemoveWatchlist = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: removeWatchlistApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['watchlist'] }); toast.success('Removed') },
  })
}
