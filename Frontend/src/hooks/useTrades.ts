import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTradesApi, createTradeApi, updateTradeApi, deleteTradeApi, importCsvApi } from '../api/trades'
import type { TradeFilters, CreateTradePayload } from '../api/trades'
import toast from 'react-hot-toast'

export const useTrades = (filters: TradeFilters) =>
  useQuery({
    queryKey: ['trades', filters],
    queryFn: async () => {
      const { data } = await getTradesApi(filters)
      return data.data
    },
  })

export const useCreateTrade = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: CreateTradePayload) => createTradeApi(p),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['trades'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      const warnings = res.data.data.warnings
      if (warnings?.length) warnings.forEach((w) => toast(w, { icon: '⚠️' }))
      else toast.success('Trade logged successfully')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to log trade'),
  })
}

export const useUpdateTrade = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTradePayload> }) => updateTradeApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Trade updated')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update'),
  })
}

export const useDeleteTrade = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTradeApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Trade deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })
}

export const useImportCsv = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => importCsvApi(file),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['trades'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      const { imported, failed } = res.data.data
      toast.success(`Imported ${imported} trades. ${failed} failed.`)
    },
    onError: () => toast.error('Import failed'),
  })
}
