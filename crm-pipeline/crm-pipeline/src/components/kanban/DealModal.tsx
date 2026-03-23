// src/components/kanban/DealModal.tsx
'use client'

import { useState, useEffect } from 'react'
import type { Deal, Stage, CreateDealPayload } from '@/types/crm'

interface DealModalProps {
  stages:       Stage[]
  initialStage?: string
  deal?:         Deal | null   // se passado, modo edição
  onSave:       (payload: CreateDealPayload | Partial<Deal>) => Promise<void>
  onClose:      () => void
}

const OWNER_COLORS = ['#16a34a','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#ec4899']

export function DealModal({ stages, initialStage, deal, onSave, onClose }: DealModalProps) {
  const isEdit = !!deal

  const [title,      setTitle]      = useState(deal?.title ?? '')
  const [value,      setValue]      = useState(String(deal?.value ?? ''))
  const [stageId,    setStageId]    = useState(deal?.stage_id ?? initialStage ?? stages[0]?.id ?? '')
  const [prob,       setProb]       = useState(String(deal?.probability ?? 20))
  const [closeDate,  setCloseDate]  = useState(deal?.expected_close_date ?? '')
  const [ownerName,  setOwnerName]  = useState(deal?.owner_name ?? '')
  const [ownerColor, setOwnerColor] = useState(deal?.owner_color ?? OWNER_COLORS[0])
  const [tags,       setTagsState]  = useState((deal?.tags ?? []).join(', '))
  const [notes,      setNotes]      = useState(deal?.notes ?? '')
  const [saving,     setSaving]     = useState(false)
  const [err,        setErr]        = useState('')

  // Preenche probabilidade automática com base na stage
  useEffect(() => {
    if (!isEdit) {
      const stage = stages.find((s) => s.id === stageId)
      if (stage) setProb(String(stage.probability))
    }
  }, [stageId, stages, isEdit])

  function initials(name: string) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('')
  }

  async function handleSave() {
    if (!title.trim()) { setErr('Título é obrigatório'); return }
    if (!stageId)       { setErr('Selecione uma etapa');  return }

    setSaving(true)
    try {
      const tagsArr = tags.split(',').map((t) => t.trim()).filter(Boolean)
      await onSave({
        ...(isEdit ? {} : { pipeline_id: stages[0] ? undefined : '' }),
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-800">
            {isEdit ? 'Editar Negócio' : 'Novo Negócio'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {err && (
            <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>
          )}

          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Título *</label>
            <input
              className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400 transition"
              placeholder="Ex: Empresa X · Projeto Y"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Valor (R$)</label>
              <input
                type="number"
                className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400 transition"
                placeholder="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Probabilidade (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400 transition"
                value={prob}
                onChange={(e) => setProb(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Etapa</label>
            <select
              className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400 transition bg-white"
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Data de fechamento</label>
            <input
              type="date"
              className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400 transition"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Responsável</label>
            <div className="flex gap-2">
              <input
                className="flex-1 text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400 transition"
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
                    style={{
                      backgroundColor: c,
                      borderColor: ownerColor === c ? '#374151' : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Tags (separadas por vírgula)</label>
            <input
              className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400 transition"
              placeholder="Prioritário, Enterprise..."
              value={tags}
              onChange={(e) => setTagsState(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Notas</label>
            <textarea
              rows={3}
              className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400 transition resize-none"
              placeholder="Contexto, detalhes importantes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
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
