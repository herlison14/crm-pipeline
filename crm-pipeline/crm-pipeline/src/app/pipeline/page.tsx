// src/app/pipeline/page.tsx
import { KanbanBoard } from '@/components/kanban/KanbanBoard'

export const metadata = {
  title: 'Pipeline · CRM Pro',
}

export default function PipelinePage() {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <KanbanBoard />
    </div>
  )
}
