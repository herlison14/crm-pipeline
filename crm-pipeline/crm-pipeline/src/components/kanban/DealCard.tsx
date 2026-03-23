// src/components/kanban/DealCard.tsx
'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatCurrency } from '@/lib/supabase'
import type { Deal } from '@/types/crm'

interface DealCardProps {
  deal:       Deal
  onEdit?:    (deal: Deal) => void
  onDelete?:  (dealId: string) => void
  isDragging?: boolean
}

const PROB_STYLE: Record<string, string> = {
  high:   'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  low:    'bg-red-50 text-red-600',
}

function probLevel(p: number) {
  if (p >= 65) return 'high'
  if (p >= 35) return 'medium'
  return 'low'
}

export function DealCard({ deal, onEdit, onDelete, isDragging }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: deal.id, data: { deal } })

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isSortableDragging ? 0.4 : 1,
  }

  const level = probLevel(deal.probability)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative bg-white border border-gray-200 rounded-xl p-3
        cursor-grab active:cursor-grabbing select-none
        hover:border-gray-300 hover:shadow-sm
        transition-all duration-150
        ${isDragging ? 'shadow-lg rotate-1 scale-105' : ''}
      `}
    >
      {/* Ações rápidas */}
      <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(deal) }}
            className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs transition-colors"
            title="Editar"
          >
            ✎
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(deal.id) }}
            className="w-6 h-6 flex items-center justify-center rounded-md bg-red-50 hover:bg-red-100 text-red-500 text-xs transition-colors"
            title="Excluir"
          >
            ✕
          </button>
        )}
      </div>

      {/* Título */}
      <p className="text-[13px] font-medium text-gray-900 leading-snug pr-12 mb-1">
        {deal.title}
      </p>

      {/* Empresa do contato */}
      {deal.contact?.company && (
        <p className="text-[11px] text-gray-400 mb-2">{deal.contact.company}</p>
      )}

      {/* Tags */}
      {deal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {deal.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-[13px] font-semibold text-gray-800">
          {formatCurrency(deal.value, deal.currency)}
        </span>

        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PROB_STYLE[level]}`}>
            {deal.probability}%
          </span>
          {deal.owner_initials && (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: deal.owner_color }}
              title={deal.owner_name ?? ''}
            >
              {deal.owner_initials}
            </div>
          )}
        </div>
      </div>

      {/* Data de fechamento */}
      {deal.expected_close_date && (
        <p className="text-[10px] text-gray-400 mt-1.5">
          Fecha: {new Date(deal.expected_close_date).toLocaleDateString('pt-BR')}
        </p>
      )}
    </div>
  )
}
