// src/types/crm.ts
// Tipos centrais do CRM — gerados a partir do schema do Supabase

export interface Pipeline {
  id: string
  name: string
  description: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Stage {
  id: string
  pipeline_id: string
  name: string
  position: number
  color: string
  probability: number
  created_at: string
}

export interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  avatar_url: string | null
  created_at: string
}

export type DealStatus = 'open' | 'won' | 'lost'

export interface Deal {
  id: string
  pipeline_id: string
  stage_id: string
  contact_id: string | null
  title: string
  value: number
  currency: string
  probability: number
  expected_close_date: string | null
  owner_name: string | null
  owner_initials: string | null
  owner_color: string
  tags: string[]
  lost_reason: string | null
  status: DealStatus
  position: number
  notes: string | null
  created_at: string
  updated_at: string
  // join
  contact?: Contact
}

export interface DealHistory {
  id: string
  deal_id: string
  from_stage_id: string | null
  to_stage_id: string | null
  moved_by: string | null
  note: string | null
  created_at: string
}

// ---- UI helpers ----

export interface KanbanColumn {
  stage: Stage
  deals: Deal[]
  totalValue: number
}

export interface CreateDealPayload {
  pipeline_id: string
  stage_id: string
  title: string
  value: number
  probability?: number
  expected_close_date?: string
  owner_name?: string
  owner_initials?: string
  owner_color?: string
  tags?: string[]
  contact_id?: string
}

export interface UpdateDealPayload {
  stage_id?: string
  title?: string
  value?: number
  probability?: number
  position?: number
  status?: DealStatus
  lost_reason?: string
  tags?: string[]
  notes?: string
}
