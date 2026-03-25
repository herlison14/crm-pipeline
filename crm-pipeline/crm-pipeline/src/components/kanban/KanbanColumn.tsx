// src/components/kanban/KanbanColumn.tsx
'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DealCard } from './DealCard'
import { formatCurrency } from '@/lib/supabase'
import type { KanbanColumn as KanbanColumnType, Deal } from '@/types/crm'

interface KanbanColumnProps {
  column:    KanbanColumnType
  onAddDeal:   (stageId: string) => void
  onEditDeal:  (deal: Deal) => void
  onDeleteDeal:(dealId: string) => void
}

export function KanbanColumn({
  column,
  onAddDeal,
  onEditDeal,
  onDeleteDeal,
}: KanbanColumnProps) {
  const { stage, deals, totalValue } = column

  const { setNodeRef, isOver } = useDroppable({
    id:   stage.id,
    data: { stageId: stage.id },
  })

  const dealIds = deals.map((d) => d.id)

  return (
    <div className="flex flex-col w-[80vw] min-w-[80vw] sm:w-[220px] sm:min-w-[220px] sm:max-w-[220px]">
      {/* Cabeçalho da coluna */}
      <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Indicador colorido */}
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: stage.color }}
          />
          <span className="text-[12px] font-semibold text-gray-700">{stage.name}</span>
          <span className="text-[11px] text-gray-400">({deals.length})</span>
        </div>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
          style={{
            backgroundColor: stage.color + '18',
            color: stage.color,
          }}
        >
          {formatCurrency(totalValue)}
        </span>
      </div>

      {/* Área droppable dos cards */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 flex flex-col gap-2 min-h-[120px] rounded-xl p-2 transition-colors duration-150
          ${isOver ? 'bg-blue-50/60 ring-2 ring-blue-200' : 'bg-gray-50/60'}
        `}
      >
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onEdit={onEditDeal}
              onDelete={onDeleteDeal}
            />
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] text-gray-400 text-center">
              Arraste um negócio<br />para esta etapa
            </p>
          </div>
        )}
      </div>

      {/* Botão adicionar */}
      <button
        onClick={() => onAddDeal(stage.id)}
        className="
          mt-2 w-full py-2 text-[12px] text-gray-400 hover:text-gray-600
          border border-dashed border-gray-200 hover:border-gray-300
          rounded-xl transition-colors duration-150
          flex items-center justify-center gap-1
        "
      >
        <span className="text-base leading-none">+</span>
        Adicionar negócio
      </button>
    </div>
  )
}
