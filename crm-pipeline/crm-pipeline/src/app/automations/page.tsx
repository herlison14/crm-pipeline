// src/app/automations/page.tsx — Automações
export const metadata = { title: 'Automações · CRM Pro' }

const AUTOMATIONS = [
  {
    active: true,
    name:    'Notificar no avanço de etapa',
    trigger: 'Negócio movido para "Proposta"',
    action:  'Enviar e-mail para responsável',
    runs:    142,
  },
  {
    active: true,
    name:    'Follow-up automático',
    trigger: 'Negócio inativo por 7 dias',
    action:  'Criar tarefa de follow-up',
    runs:    38,
  },
  {
    active: false,
    name:    'Alerta de negócio perdido',
    trigger: 'Status alterado para "Perdido"',
    action:  'Notificar gerente por e-mail',
    runs:    9,
  },
  {
    active: true,
    name:    'Boas-vindas ao cliente',
    trigger: 'Status alterado para "Ganho"',
    action:  'Enviar e-mail de onboarding',
    runs:    21,
  },
]

export default function AutomationsPage() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-gray-900">Automações</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">4 automações · 3 ativas</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">
          <span className="text-base leading-none">+</span>
          Nova Automação
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-3">
        {AUTOMATIONS.map((a) => (
          <div key={a.name} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-5">
            {/* Toggle visual */}
            <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${a.active ? 'bg-emerald-500' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${a.active ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>

            <div className="flex-1">
              <p className="text-[13px] font-semibold text-gray-800">{a.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-medium">⚡ {a.trigger}</span>
                <span className="text-[11px] text-gray-300">→</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 font-medium">▷ {a.action}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[18px] font-bold text-gray-800">{a.runs}</p>
              <p className="text-[10px] text-gray-400">execuções</p>
            </div>

            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${a.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {a.active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        ))}

        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center mt-4">
          <p className="text-[13px] text-gray-400">
            Gatilhos avançados e ações customizadas serão implementados no módulo completo de Automações.
          </p>
        </div>
      </div>
    </div>
  )
}
