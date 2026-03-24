// src/app/contacts/page.tsx — Contatos
export const metadata = { title: 'Contatos · CRM Pro' }

const MOCK_CONTACTS = [
  { initials: 'AM', name: 'Ana Martins',    company: 'TechBrasil Ltda',    email: 'ana@techbrasil.com',    score: 92, tag: 'Cliente'    },
  { initials: 'RS', name: 'Rafael Silva',   company: 'Inovação Digital SA', email: 'rafael@inovacao.com',  score: 78, tag: 'Lead'       },
  { initials: 'CF', name: 'Carla Ferreira', company: 'Nexus Soluções',      email: 'carla@nexus.com.br',   score: 85, tag: 'Prospect'   },
  { initials: 'JO', name: 'João Oliveira',  company: 'DataFlow Systems',    email: 'joao@dataflow.io',     score: 61, tag: 'Lead'       },
  { initials: 'MS', name: 'Marina Santos',  company: 'CloudBR Tecnologia',  email: 'marina@cloudbr.com',   score: 95, tag: 'Cliente'    },
  { initials: 'PL', name: 'Pedro Lima',     company: 'Alpha Ventures',      email: 'pedro@alphavc.com.br', score: 44, tag: 'Inativo'    },
]

const TAG_COLORS: Record<string, string> = {
  Cliente:  'bg-emerald-100 text-emerald-700',
  Lead:     'bg-blue-100 text-blue-700',
  Prospect: 'bg-violet-100 text-violet-700',
  Inativo:  'bg-gray-100 text-gray-500',
}

const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
]

export default function ContactsPage() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-gray-900">Contatos</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">124 contatos cadastrados</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">
          <span className="text-base leading-none">+</span>
          Novo Contato
        </button>
      </div>

      {/* Filtros */}
      <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar contato..."
          className="flex-1 max-w-xs px-3 py-1.5 text-[13px] border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400"
        />
        {['Todos', 'Cliente', 'Lead', 'Prospect', 'Inativo'].map((f) => (
          <button
            key={f}
            className={`px-3 py-1 text-[12px] rounded-lg border transition-colors ${
              f === 'Todos'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Contato</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Empresa</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">E-mail</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tag</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CONTACTS.map((c, i) => (
                <tr key={c.email} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                        {c.initials}
                      </div>
                      <span className="font-medium text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.company}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${TAG_COLORS[c.tag]}`}>
                      {c.tag}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${c.score}%` }}
                        />
                      </div>
                      <span className="text-gray-600 font-medium">{c.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
