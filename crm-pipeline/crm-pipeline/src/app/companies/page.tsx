// src/app/companies/page.tsx — Empresas
export const metadata = { title: 'Empresas · CRM Pro' }

const MOCK_COMPANIES = [
  { initials: 'TB', name: 'TechBrasil Ltda',    sector: 'Tecnologia',   contacts: 8,  deals: 3, value: 'R$ 84.000'  },
  { initials: 'ID', name: 'Inovação Digital SA', sector: 'SaaS',         contacts: 5,  deals: 2, value: 'R$ 52.000'  },
  { initials: 'NX', name: 'Nexus Soluções',      sector: 'Consultoria',  contacts: 12, deals: 5, value: 'R$ 130.000' },
  { initials: 'DF', name: 'DataFlow Systems',    sector: 'Dados',        contacts: 4,  deals: 1, value: 'R$ 18.500'  },
  { initials: 'CB', name: 'CloudBR Tecnologia',  sector: 'Infraestrutura', contacts: 7, deals: 4, value: 'R$ 97.000' },
]

const SECTOR_COLORS: Record<string, string> = {
  Tecnologia:     'bg-blue-100 text-blue-700',
  SaaS:           'bg-violet-100 text-violet-700',
  Consultoria:    'bg-amber-100 text-amber-700',
  Dados:          'bg-cyan-100 text-cyan-700',
  Infraestrutura: 'bg-emerald-100 text-emerald-700',
}

export default function CompaniesPage() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-gray-900">Empresas</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">5 empresas cadastradas</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">
          <span className="text-base leading-none">+</span>
          Nova Empresa
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 gap-3">
          {MOCK_COMPANIES.map((c) => (
            <div key={c.name} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:border-emerald-200 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[13px] font-bold text-gray-600">
                {c.initials}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-gray-800">{c.name}</p>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${SECTOR_COLORS[c.sector] ?? 'bg-gray-100 text-gray-600'}`}>
                  {c.sector}
                </span>
              </div>
              <div className="text-center">
                <p className="text-[12px] text-gray-400">Contatos</p>
                <p className="text-[15px] font-semibold text-gray-700">{c.contacts}</p>
              </div>
              <div className="text-center">
                <p className="text-[12px] text-gray-400">Negócios</p>
                <p className="text-[15px] font-semibold text-gray-700">{c.deals}</p>
              </div>
              <div className="text-center">
                <p className="text-[12px] text-gray-400">Valor total</p>
                <p className="text-[15px] font-semibold text-emerald-700">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
