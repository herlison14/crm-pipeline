// src/app/page.tsx — Dashboard
export const metadata = { title: 'Dashboard · CRM Pro' }

const KPI_CARDS = [
  { label: 'Receita total',      value: 'R$ 248.500',  delta: '+12%',  color: 'emerald' },
  { label: 'Negócios em aberto', value: '37',           delta: '+3',    color: 'blue'    },
  { label: 'Taxa de conversão',  value: '28%',          delta: '+4pp',  color: 'violet'  },
  { label: 'Negócios ganhos',    value: '14',           delta: '+2',    color: 'amber'   },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-gray-900">Dashboard</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Visão geral · Março 2026</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {KPI_CARDS.map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-[11px] text-gray-400 font-medium">{kpi.label}</p>
              <p className="text-[22px] font-bold text-gray-900 mt-1">{kpi.value}</p>
              <span className="text-[11px] text-emerald-600 font-medium">{kpi.delta} vs mês anterior</span>
            </div>
          ))}
        </div>

        {/* Placeholder gráfico */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-[14px] font-semibold text-gray-700 mb-4">Receita por mês</h2>
          <div className="flex items-end gap-3 h-40">
            {[40, 65, 55, 80, 70, 90, 75, 95, 85, 100, 88, 110].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-emerald-500 rounded-t-md opacity-80"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-gray-400">
                  {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Coming soon banner */}
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-[13px] text-gray-400">Gráficos detalhados e KPIs avançados serão implementados no módulo de Dashboard completo.</p>
        </div>
      </div>
    </div>
  )
}
