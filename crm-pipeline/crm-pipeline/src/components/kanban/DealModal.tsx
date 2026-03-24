// src/components/kanban/DealModal.tsx
'use client'

import { useState, useEffect } from 'react'
import type { Deal, Stage, CreateDealPayload } from '@/types/crm'

interface DealModalProps {
  stages:        Stage[]
  initialStage?: string
  deal?:         Deal | null
  onSave:        (payload: CreateDealPayload | Partial<Deal>) => Promise<void>
  onClose:       () => void
}

const OWNER_COLORS  = ['#16a34a','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#ec4899']
const LEAD_SOURCES  = ['Site', 'Indicação', 'Feira', 'LinkedIn', 'Email', 'Cold Call', 'Outro']
const STATUS_OPTS   = [{ value: 'open', label: 'Em andamento' }, { value: 'won', label: 'Ganho' }, { value: 'lost', label: 'Perdido' }]

export function DealModal({ stages, initialStage, deal, onSave, onClose }: DealModalProps) {
  const isEdit = !!deal

  const [title,          setTitle]          = useState(deal?.title ?? '')
  const [value,          setValue]          = useState(String(deal?.value ?? ''))
  const [stageId,        setStageId]        = useState(deal?.stage_id ?? initialStage ?? stages[0]?.id ?? '')
  const [prob,           setProb]           = useState(String(deal?.probability ?? 20))
  const [closeDate,      setCloseDate]      = useState(deal?.expected_close_date ?? '')
  const [ownerName,      setOwnerName]      = useState(deal?.owner_name ?? '')
  const [ownerColor,     setOwnerColor]     = useState(deal?.owner_color ?? OWNER_COLORS[0])
  const [tags,           setTagsState]      = useState((deal?.tags ?? []).join(', '))
  const [notes,          setNotes]          = useState(deal?.notes ?? '')
  const [leadSource,     setLeadSource]     = useState(deal?.lead_source ?? '')
  const [nextAction,     setNextAction]     = useState(deal?.next_action ?? '')
  const [nextActionDate, setNextActionDate] = useState(deal?.next_action_date ?? '')
  const [status,         setStatus]         = useState(deal?.status ?? 'open')
  const [lostReason,     setLostReason]     = useState(deal?.lost_reason ?? '')
  const [saving,         setSaving]         = useState(false)
  const [err,            setErr]            = useState('')

  useEffect(() => {
    if (!isEdit) {
      const stage = stages.find((s) => s.id === stageId)
      if (stage) setProb(String(stage.probability))
    }
  }, [stageId, stages, isEdit])

  function initials(name: string) {
    return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
  }

  async function handleSave() {
    if (!title.trim()) { setErr('Título é obrigatório'); return }
    if (!stageId)       { setErr('Selecione uma etapa');  return }
    setSaving(true)
    try {
      const tagsArr = tags.split(',').map((t) => t.trim()).filter(Boolean)
      await onSave({
        stage_id:            stageId,
        title:               title.trim(),
        value:               parseFloat(value) || 0,
        probability:         parseInt(prob) || 0,
        expected_close_date: closeDate || undefined,
        owner_name:          ownerName.trim() || undefined,
        owner_initials:      ownerName.trim() ? initials(ownerName) : undefined,
        owner_color:         ownerColor,
        tags:                tagsArr,
        notes:               notes.trim() || undefined,
        lead_source:         leadSource || undefined,
        next_action:         nextAction.trim() || undefined,
        next_action_date:    nextActionDate || undefined,
        status:              status as any,
        lost_reason:         status === 'lost' ? lostReason.trim() || undefined : undefined,
      } as any)
      onClose()
    } catch (e: any) {
      setErr(e?.message ?? 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-800">
            {isEdit ? 'Editar Negócio' : 'Novo Negócio'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >✕</button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {err && (
            <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>
          )}

          {/* Título */}
          <Field label="Título *">
            <input
              className={INPUT}
              placeholder="Ex: Empresa X · Projeto Y"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>

          {/* Valor + Probabilidade */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)">
              <input type="number" className={INPUT} placeholder="0" value={value} onChange={(e) => setValue(e.target.value)} />
            </Field>
            <Field label="Probabilidade (%)">
              <input type="number" min="0" max="100" className={INPUT} value={prob} onChange={(e) => setProb(e.target.value)} />
            </Field>
          </div>

          {/* Etapa + Status */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Etapa">
              <select className={INPUT} value={stageId} onChange={(e) => setStageId(e.target.value)}>
                {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={INPUT} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Motivo de perda (só se perdido) */}
          {status === 'lost' && (
            <Field label="Motivo da Perda">
              <input
                className={INPUT}
                placeholder="Ex: Preço, Concorrente, Sem budget..."
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
              />
            </Field>
          )}

          {/* Data de fechamento + Origem */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data de Fechamento">
              <input type="date" className={INPUT} value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
            </Field>
            <Field label="Origem do Lead">
              <select className={INPUT} value={leadSource} onChange={(e) => setLeadSource(e.target.value)}>
                <option value="">Selecionar...</option>
                {['Site','Indicação','Feira','LinkedIn','Email','Cold Call','Outro'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Próxima ação */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Próxima Ação">
              <input
                className={INPUT}
                placeholder="Ex: Ligar, Enviar proposta..."
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
              />
            </Field>
            <Field label="Data da Ação">
              <input type="date" className={INPUT} value={nextActionDate} onChange={(e) => setNextActionDate(e.target.value)} />
            </Field>
          </div>

          {/* Responsável */}
          <Field label="Responsável">
            <div className="flex gap-2">
              <input
                className={`flex-1 ${INPUT}`}
                placeholder="Nome do responsável"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
              <div className="flex items-center gap-1">
                {OWNER_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setOwnerColor(c)}
                    className="w-5 h-5 rounded-full border-2 transition-all"
                    style={{ backgroundColor: c, borderColor: ownerColor === c ? '#374151' : 'transparent' }}
                  />
                ))}
              </div>
            </div>
          </Field>

          {/* Tags */}
          <Field label="Tags (separadas por vírgula)">
            <input
              className={INPUT}
              placeholder="Prioritário, Enterprise..."
              value={tags}
              onChange={(e) => setTagsState(e.target.value)}
            />
          </Field>

          {/* Notas */}
          <Field label="Notas">
            <textarea
              rows={3}
              className={`${INPUT} resize-none`}
              placeholder="Contexto, detalhes importantes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >Cancelar</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar Negócio'}
          </button>
        </div>
      </div>
    </div>
  )
}

const INPUT = 'w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400 transition bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}
