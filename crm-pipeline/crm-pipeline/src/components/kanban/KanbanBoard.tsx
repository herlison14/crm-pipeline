// src/components/kanban/KanbanBoard.tsx
'use client'

import { useState, useCallback, useRef } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

import { KanbanColumn } from './KanbanColumn'
import { DealCard }     from './DealCard'
import { DealModal }    from './DealModal'
import { usePipeline }  from '@/hooks/usePipeline'
import { formatCurrency } from '@/lib/supabase'
import type { Deal } from '@/types/crm'

export function KanbanBoard() {
  const {
    pipeline,
    stages,
    columns,
    loading,
    error,
    moveDealOpt,
    addDeal,
    editDeal,
    removeDeal,
  } = usePipeline()

  const [activeDeal,    setActiveDeal]    = useState<Deal | null>(null)
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editingDeal,   setEditingDeal]   = useState<Deal | null>(null)
  const [targetStageId, setTargetStageId] = useState<string>('')
  const [activeColIdx,  setActiveColIdx]  = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // ── Drag start ──────────────────────────────────────────
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const deal = event.active.data.current?.deal as Deal | undefined
    if (deal) setActiveDeal(deal)
  }, [])

  // ── Drag over (hover) ───────────────────────────────────
  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Podemos adicionar visual hints aqui se necessário
  }, [])

  // ── Drag end ────────────────────────────────────────────
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDeal(null)

      const { active, over } = event
      if (!over) return

      const dealId      = active.id as string
      const overData    = over.data.current

      // Acha o deal sendo arrastado
      const allDeals = columns.flatMap((c) => c.deals)
      const deal     = allDeals.find((d) => d.id === dealId)
      if (!deal) return

      const fromStageId = deal.stage_id

      // Destino pode ser: uma stage (droppable) ou outro card (sortable)
      let toStageId   = fromStageId
      let newPosition = 0

      if (overData?.stageId) {
        // Solto direto na coluna vazia
        toStageId   = overData.stageId
        const col   = columns.find((c) => c.stage.id === toStageId)
        newPosition = col ? col.deals.length : 0
      } else if (overData?.deal) {
        // Solto em cima de outro card
        const overDeal  = overData.deal as Deal
        toStageId       = overDeal.stage_id
        newPosition     = overDeal.position
      } else {
        // over.id pode ser um stageId
        const maybeStage = stages.find((s) => s.id === over.id)
        if (maybeStage) {
          toStageId   = maybeStage.id
          const col   = columns.find((c) => c.stage.id === toStageId)
          newPosition = col ? col.deals.length : 0
        }
      }

      // Se não moveu nada, ignora
      if (fromStageId === toStageId && deal.position === newPosition) return

      await moveDealOpt({ dealId, fromStageId, toStageId, newPosition })
    },
    [columns, stages, moveDealOpt]
  )

  // ── Modal handlers ───────────────────────────────────────
  function openCreate(stageId: string) {
    setEditingDeal(null)
    setTargetStageId(stageId)
    setModalOpen(true)
  }

  function openEdit(deal: Deal) {
    setEditingDeal(deal)
    setTargetStageId(deal.stage_id)
    setModalOpen(true)
  }

  async function handleSave(payload: any) {
    if (editingDeal) {
      await editDeal(editingDeal.id, payload)
    } else {
      if (!pipeline) return
      await addDeal({ ...payload, pipeline_id: pipeline.id })
    }
  }

  async function handleDelete(dealId: string) {
    if (!confirm('Excluir este negócio?')) return
    await removeDeal(dealId)
  }

  // ── Carrossel mobile ────────────────────────────────────
  function handleScroll() {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const colWidth = el.scrollWidth / columns.length
    const idx = Math.round(el.scrollLeft / colWidth)
    setActiveColIdx(Math.min(Math.max(idx, 0), columns.length - 1))
  }

  function scrollToCol(idx: number) {
    if (!scrollRef.current || !columns.length) return
    const el = scrollRef.current
    const colWidth = el.scrollWidth / columns.length
    el.scrollTo({ left: colWidth * idx, behavior: 'smooth' })
    setActiveColIdx(idx)
  }

  // ── KPIs do topo ────────────────────────────────────────
  const totalValue    = columns.reduce((s, c) => s + c.totalValue, 0)
  const totalDeals    = columns.reduce((s, c) => s + c.deals.length, 0)
  const wonDeals      = columns.flatMap((c) => c.deals).filter((d) => d.status === 'won')
  const wonValue      = wonDeals.reduce((s, d) => s + d.value, 0)

  // ── Loading / Error ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-[13px]">Carregando pipeline...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 text-[13px] mb-2">{error}</p>
          <p className="text-gray-400 text-[11px]">Verifique as variáveis de ambiente do Supabase</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Topbar do pipeline ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-6 py-3 border-b border-gray-100 bg-white">
        <div>
          <h1 className="text-[15px] md:text-[16px] font-semibold text-gray-900">
            {pipeline?.name ?? 'Pipeline'}
          </h1>
          <p className="text-[11px] md:text-[12px] text-gray-400 mt-0.5">
            {totalDeals} negócios · {formatCurrency(totalValue)} em aberto
          </p>
        </div>

        {/* KPI chips + botão */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-center">
            <p className="text-[10px] font-medium">Ganhos</p>
            <p className="text-[13px] font-semibold">{formatCurrency(wonValue)}</p>
          </div>
          <div className="hidden sm:block px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-center">
            <p className="text-[10px] font-medium">Negócios</p>
            <p className="text-[13px] font-semibold">{totalDeals}</p>
          </div>

          <button
            onClick={() => openCreate(stages[0]?.id ?? '')}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
          >
            <span className="text-base leading-none">+</span>
            <span className="hidden sm:inline">Novo Negócio</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Scroll container — snap no mobile, livre no desktop */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="
              flex-1 overflow-x-auto overflow-y-auto
              snap-x snap-mandatory md:snap-none
              scroll-smooth
            "
          >
            <div className="flex gap-3 p-4 md:p-6 min-h-full w-max">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.stage.id}
                  column={column}
                  onAddDeal={openCreate}
                  onEditDeal={openEdit}
                  onDeleteDeal={handleDelete}
                />
              ))}
            </div>
          </div>

          {/* Card fantasma durante o drag */}
          <DragOverlay>
            {activeDeal ? (
              <DealCard deal={activeDeal} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* ── Dots + Nav — só mobile ── */}
        {columns.length > 0 && (
          <div className="md:hidden flex items-center justify-center gap-3 py-3 bg-white border-t border-gray-100">
            {/* Seta anterior */}
            <button
              onClick={() => scrollToCol(activeColIdx - 1)}
              disabled={activeColIdx === 0}
              className="p-1.5 rounded-lg text-gray-400 disabled:opacity-30 hover:text-gray-600 transition-colors"
            >
              ‹
            </button>

            {/* Label da etapa atual */}
            <div className="flex items-center gap-2">
              {columns.map((col, i) => (
                <button
                  key={col.stage.id}
                  onClick={() => scrollToCol(i)}
                  className={`transition-all duration-200 rounded-full ${
                    i === activeColIdx
                      ? 'w-5 h-2'
                      : 'w-2 h-2 opacity-40 hover:opacity-70'
                  }`}
                  style={{
                    backgroundColor: i === activeColIdx
                      ? col.stage.color
                      : '#94A3B8',
                  }}
                  title={col.stage.name}
                />
              ))}
            </div>

            {/* Seta próxima */}
            <button
              onClick={() => scrollToCol(activeColIdx + 1)}
              disabled={activeColIdx === columns.length - 1}
              className="p-1.5 rounded-lg text-gray-400 disabled:opacity-30 hover:text-gray-600 transition-colors"
            >
              ›
            </button>

            {/* Nome da etapa atual */}
            <span
              className="text-[11px] font-semibold ml-1"
              style={{ color: columns[activeColIdx]?.stage.color }}
            >
              {columns[activeColIdx]?.stage.name}
              <span className="text-gray-400 font-normal ml-1">
                ({columns[activeColIdx]?.deals.length})
              </span>
            </span>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <DealModal
          stages={stages}
          initialStage={targetStageId}
          deal={editingDeal}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
