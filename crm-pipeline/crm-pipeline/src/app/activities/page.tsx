// src/app/activities/page.tsx — Atividades
export const metadata = { title: 'Atividades · CRM Pro' }

const ACTIVITIES = [
  { type: '📞', title: 'Ligação com Ana Martins',       company: 'TechBrasil',    date: 'Hoje, 10:00',        status: 'pending',   deal: 'Renovação Enterprise' },
  { type: '✉️', title: 'Enviar proposta para Rafael',    company: 'Inovação Digital', date: 'Hoje, 14:00',    status: 'pending',   deal: 'Plano Starter'        },
  { type: '🤝', title: 'Reunião de onboarding Nexus',   company: 'Nexus Soluções', date: 'Amanhã, 09:30',    status: 'scheduled', deal: 'Implementação Pro'    },
  { type: '📋', title: 'Follow-up DataFlow',            company: 'DataFlow',      date: 'Amanhã, 15:00',     status: 'scheduled', deal: 'Licença Anual'        },
  { type: '📞', title: 'Demo CloudBR',                  company: 'CloudBR',       date: 'Sex, 11:00',        status: 'scheduled', deal: 'Infraestrutura Cloud' },
  { type: '✅', title: 'Contrato assinado TechBrasil',  company: 'TechBrasil',    date: 'Ontem, 16:30',      status: 'done',      deal: 'Plano Premium'        },
  { type: '✅', title: 'Proposta aprovada Nexus',       company: 'Nexus',         date: 'Ontem, 09:00',      status: 'done',      deal: 'Consultoria Anual'    },
]

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  scheduled: 'bg-blue-100 text-blue-700',
  done:      'bg-emerald-100 text-emerald-700',
}
const STATUS_LABEL: Record<string, string> = {
  pending:   'Pendente',
  scheduled: 'Agendado',
  done:      'Concluído',
}

export default function ActivitiesPage() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-gray-900">Atividades</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">7 atividades programadas</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">
          <span className="text-base leading-none">+</span>
          Nova Atividade
        </button>
      </div>

      {/* Tabs de filtro */}
      <div className="px-6 py-3 bg-white border-b border-gray-100 flex gap-4">
        {['Todas', 'Pendentes', 'Agendadas', 'Concluídas'].map((t, i) => (
          <button
            key={t}
            className={`text-[13px] pb-2 border-b-2 transition-colors ${
              i === 0
                ? 'border-emerald-500 text-emerald-700 font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-2">
        {ACTIVITIES.map((a, i) => (
          <div
            key={i}
            className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-colors cursor-pointer hover:border-emerald-200 ${
              a.status === 'done' ? 'opacity-60' : 'border-gray-100'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-[18px]">
              {a.type}
            </div>
            <div className="flex-1">
              <p className={`text-[13px] font-medium text-gray-800 ${a.status === 'done' ? 'line-through' : ''}`}>
                {a.title}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{a.company} · {a.deal}</p>
            </div>
            <p className="text-[12px] text-gray-400">{a.date}</p>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[a.status]}`}>
              {STATUS_LABEL[a.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
