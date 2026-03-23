// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnon)

// ─────────────────────────────────────────────
// src/lib/deals.ts  — funções de acesso a dados
// ─────────────────────────────────────────────
import type {
  Pipeline,
  Stage,
  Deal,
  KanbanColumn,
  CreateDealPayload,
  UpdateDealPayload,
} from '@/types/crm'

/** Retorna o pipeline padrão */
export async function getDefaultPipeline(): Promise<Pipeline> {
  const { data, error } = await supabase
    .from('pipelines')
    .select('*')
    .eq('is_default', true)
    .single()

  if (error) throw error
  return data
}

/** Retorna todas as stages de um pipeline, ordenadas por position */
export async function getStages(pipelineId: string): Promise<Stage[]> {
  const { data, error } = await supabase
    .from('stages')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .order('position', { ascending: true })

  if (error) throw error
  return data
}

/** Retorna todos os deals de um pipeline com contato incluído */
export async function getDeals(pipelineId: string): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, contact:contacts(*)')
    .eq('pipeline_id', pipelineId)
    .order('position', { ascending: true })

  if (error) throw error
  return data
}

/** Monta as colunas do Kanban agrupando deals por stage */
export function buildKanbanColumns(stages: Stage[], deals: Deal[]): KanbanColumn[] {
  return stages.map((stage) => {
    const stageDeals = deals
      .filter((d) => d.stage_id === stage.id)
      .sort((a, b) => a.position - b.position)

    const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)

    return { stage, deals: stageDeals, totalValue }
  })
}

/** Cria um novo deal */
export async function createDeal(payload: CreateDealPayload): Promise<Deal> {
  // Determina a próxima position na stage
  const { count } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('stage_id', payload.stage_id)

  const { data, error } = await supabase
    .from('deals')
    .insert({ ...payload, position: count ?? 0 })
    .select('*, contact:contacts(*)')
    .single()

  if (error) throw error
  return data
}

/** Atualiza campos de um deal */
export async function updateDeal(id: string, payload: UpdateDealPayload): Promise<Deal> {
  const { data, error } = await supabase
    .from('deals')
    .update(payload)
    .eq('id', id)
    .select('*, contact:contacts(*)')
    .single()

  if (error) throw error
  return data
}

/** Move um deal para outra stage e reordena positions */
export async function moveDeal({
  dealId,
  fromStageId,
  toStageId,
  newPosition,
  movedBy = 'Usuário',
}: {
  dealId: string
  fromStageId: string
  toStageId: string
  newPosition: number
  movedBy?: string
}): Promise<void> {
  // 1. Abre espaço na stage destino
  await supabase.rpc('shift_deal_positions', {
    p_stage_id:    toStageId,
    p_from_pos:    newPosition,
    p_direction:   1,
  })

  // 2. Move o deal
  await supabase
    .from('deals')
    .update({ stage_id: toStageId, position: newPosition })
    .eq('id', dealId)

  // 3. Compacta posições na stage de origem (se mudou de stage)
  if (fromStageId !== toStageId) {
    await supabase.rpc('compact_stage_positions', { p_stage_id: fromStageId })
  }

  // 4. Registra histórico
  if (fromStageId !== toStageId) {
    await supabase.from('deal_history').insert({
      deal_id:       dealId,
      from_stage_id: fromStageId,
      to_stage_id:   toStageId,
      moved_by:      movedBy,
    })
  }
}

/** Deleta um deal */
export async function deleteDeal(id: string): Promise<void> {
  const { error } = await supabase.from('deals').delete().eq('id', id)
  if (error) throw error
}

/** Formata valor em BRL */
export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
