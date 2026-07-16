import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRulesApi, createRuleApi, updateRuleApi, toggleRuleApi, deleteRuleApi } from '../api/rules'
import type { RuleType } from '../types'
import toast from 'react-hot-toast'

export const useRules = () =>
  useQuery({ queryKey: ['rules'], queryFn: async () => { const { data } = await getRulesApi(); return data.data } })

export const useCreateRule = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (d: { type: RuleType; value: number | string | boolean }) => createRuleApi(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rules'] }); toast.success('Rule created') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export const useToggleRule = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: toggleRuleApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rules'] }),
  })
}

export const useDeleteRule = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteRuleApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rules'] }); toast.success('Rule deleted') },
  })
}
