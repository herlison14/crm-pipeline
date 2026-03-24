// src/hooks/usePipeline.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getDefaultPipeline,
  getStages,
  getDeals,
  buildKanbanColumns,
  moveDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  supabaseConfigured,
} from '@/lib/supabase'
import type {
  Pipeline,
  Stage,
  Deal,
  KanbanColumn,
  CreateDealPayload,
  UpdateDealPayload,
} from '@/types/crm'

interface UsePipelineReturn {
  pipeline:    Pipeline | null
  stages:      Stage[]
  columns:     KanbanColumn[]
  loading:     boolean
  error:       string | null
  moveDealOpt: (args: MoveDealArgs) => Promise<void>
  addDeal:     (payload: CreateDealPayload) => Promise<Deal>
  editDeal:    (id: string, payload: UpdateDealPayload) => Promise<void>
  removeDeal:  (id: string) => Promise<void>
  refresh:     () => Promise<void>
}

interface MoveDealArgs {
  dealId:      string
  fromStageId: string
  toStageId:   string
  newPosition: number
}

export function usePipeline(): UsePipelineReturn {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [stages,   setStages]   = useState<Stage[]>([])
  const [deals,    setDeals]    = useState<Deal[]>([])
  const [columns,  setColumns]  = useState<KanbanColumn[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabaseConfigured) {
      setError('Supabase não configurado. Adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nas variáveis de ambiente do Vercel.')
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)

      const p  = await getDefaultPipeline()
      const st = await getStages(p.id)
      const dl = await getDeals(p.id)

      setPipeline(p)
      setStages(st)
      setDeals(dl)
      setColumns(buildKanbanColumns(st, dl))
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar pipeline')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Atualiza colunas sempre que stages/deals mudam
  useEffect(() => {
    setColumns(buildKanbanColumns(stages, deals))
  }, [stages, deals])

  // ---- Mover card (optimistic update) ----
  const moveDealOpt = useCallback(async ({
    dealId,
    fromStageId,
    toStageId,
    newPosition,
  }: MoveDealArgs) => {
    // 1. Snapshot para rollback
    const prevDeals = [...deals]

    // 2. Atualização otimista local
    setDeals((prev) => {
      const updated = prev.map((d) => {
        if (d.id === dealId) {
          return { ...d, stage_id: toStageId, position: newPosition }
        }
        // Abre espaço na stage destino
        if (d.stage_id === toStageId && d.position >= newPosition && d.id !== dealId) {
          return { ...d, position: d.position + 1 }
        }
        return d
      })
      return updated
    })

    // 3. Persiste no Supabase
    try {
      await moveDeal({ dealId, fromStageId, toStageId, newPosition })
    } catch (e: any) {
      // Rollback
      setDeals(prevDeals)
      setError(e?.message ?? 'Erro ao mover negócio')
    }
  }, [deals])

  // ---- Criar deal ----
  const addDeal = useCallback(async (payload: CreateDealPayload): Promise<Deal> => {
    const deal = await createDeal(payload)
    setDeals((prev) => [...prev, deal])
    return deal
  }, [])

  // ---- Editar deal ----
  const editDeal = useCallback(async (id: string, payload: UpdateDealPayload) => {
    const updated = await updateDeal(id, payload)
    setDeals((prev) => prev.map((d) => (d.id === id ? updated : d)))
  }, [])

  // ---- Remover deal ----
  const removeDeal = useCallback(async (id: string) => {
    await deleteDeal(id)
    setDeals((prev) => prev.filter((d) => d.id !== id))
  }, [])

  return {
    pipeline,
    stages,
    columns,
    loading,
    error,
    moveDealOpt,
    addDeal,
    editDeal,
    removeDeal,
    refresh: load,
  }
}
