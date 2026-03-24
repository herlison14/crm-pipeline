// src/app/reports/page.tsx — Relatórios
export const metadata = { title: 'Relatórios · CRM Pro' }

const FUNNEL = [
  { stage: 'Prospecção',   count: 48, value: 'R$ 720.000', pct: 100 },
  { stage: 'Qualificação', count: 32, value: 'R$ 512.000', pct: 67  },
  { stage: 'Proposta',     count: 21, value: 'R$ 378.000', pct: 44  },
  { stage: 'Negociação',   count: 11, value: 'R$ 220.000', pct: 23  },
  { stage: 'Fechamento',   count: 6,  value: 'R$ 132.000', pct: 13  },
]

const COLORS = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-emerald-500',
]

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-gray-900">Relatórios</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Funil de conversão · Março 2026</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">
          ↓ Exportar PDF
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Funil visual */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-[14px] font-semibold text-gray-700 mb-5">Funil de Vendas</h2>
          <div className="space-y-3">
            {FUNNEL.map((f, i) => (
              <div key={f.stage} className="flex items-center gap-4">
                <div className="w-24 text-right text-[12px] text-gray-500 shrink-0">{f.stage}</div>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${COLORS[i]} rounded-lg flex items-center px-3 transition-all`}
                    style={{ width: `${f.pct}%` }}
                  >
                    <span className="text-[11px] text-white font-medium">{f.count}</span>
                  </div>
                </div>
                <div className="w-24 text-[12px] text-gray-500 shrink-0">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs resumo */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Taxa lead → cliente', value: '12,5%' },
            { label: 'Ticket médio',        value: 'R$ 22.000' },
            { label: 'Ciclo médio de venda', value: '28 dias' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <p className="text-[11px] text-gray-400 font-medium">{k.label}</p>
              <p className="text-[24px] font-bold text-gray-900 mt-1">{k.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
