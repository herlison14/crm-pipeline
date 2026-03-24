'use client'
// src/app/contacts/page.tsx — Contatos

import { useState } from 'react'

type Tag = 'Cliente' | 'Lead' | 'Prospect' | 'Inativo'

interface Contact {
  initials: string
  name:     string
  company:  string
  email:    string
  phone:    string
  score:    number
  tag:      Tag
}

const INITIAL_CONTACTS: Contact[] = [
  { initials: 'AM', name: 'Ana Martins',    company: 'TechBrasil Ltda',    email: 'ana@techbrasil.com',    phone: '(11) 9 8765-4321', score: 92, tag: 'Cliente'  },
  { initials: 'RS', name: 'Rafael Silva',   company: 'Inovação Digital SA', email: 'rafael@inovacao.com',  phone: '(21) 9 9123-4567', score: 78, tag: 'Lead'     },
  { initials: 'CF', name: 'Carla Ferreira', company: 'Nexus Soluções',      email: 'carla@nexus.com.br',   phone: '(31) 9 7654-3210', score: 85, tag: 'Prospect' },
  { initials: 'JO', name: 'João Oliveira',  company: 'DataFlow Systems',    email: 'joao@dataflow.io',     phone: '(41) 9 5678-9012', score: 61, tag: 'Lead'     },
  { initials: 'MS', name: 'Marina Santos',  company: 'CloudBR Tecnologia',  email: 'marina@cloudbr.com',   phone: '(11) 9 3456-7890', score: 95, tag: 'Cliente'  },
  { initials: 'PL', name: 'Pedro Lima',     company: 'Alpha Ventures',      email: 'pedro@alphavc.com.br', phone: '(85) 9 2345-6789', score: 44, tag: 'Inativo'  },
]

const TAG_COLORS: Record<Tag, string> = {
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

const INPUT = 'w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400 transition bg-white'

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

export default function ContactsPage() {
  const [contacts,   setContacts]   = useState<Contact[]>(INITIAL_CONTACTS)
  const [search,     setSearch]     = useState('')
  const [tagFilter,  setTagFilter]  = useState<'Todos' | Tag>('Todos')
  const [modalOpen,  setModalOpen]  = useState(false)

  // Form state
  const [fName,    setFName]    = useState('')
  const [fCompany, setFCompany] = useState('')
  const [fEmail,   setFEmail]   = useState('')
  const [fPhone,   setFPhone]   = useState('')
  const [fTag,     setFTag]     = useState<Tag>('Lead')
  const [fErr,     setFErr]     = useState('')

  const filtered = contacts.filter((c) => {
    const matchTag    = tagFilter === 'Todos' || c.tag === tagFilter
    const matchSearch = search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    return matchTag && matchSearch
  })

  function handleAdd() {
    if (!fName.trim())  { setFErr('Nome é obrigatório');  return }
    if (!fEmail.trim()) { setFErr('E-mail é obrigatório'); return }
    setContacts((prev) => [{
      initials: getInitials(fName),
      name:     fName.trim(),
      company:  fCompany.trim(),
      email:    fEmail.trim(),
      phone:    fPhone.trim(),
      score:    50,
      tag:      fTag,
    }, ...prev])
    setModalOpen(false)
    setFName(''); setFCompany(''); setFEmail(''); setFPhone(''); setFErr('')
  }

  function closeModal() { setModalOpen(false); setFErr('') }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-gray-900">Contatos</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">{contacts.length} contatos cadastrados</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Novo Contato
        </button>
      </div>

      {/* Filtros */}
      <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Buscar contato..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-xs px-3 py-1.5 text-[13px] border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400"
        />
        {(['Todos', 'Cliente', 'Lead', 'Prospect', 'Inativo'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setTagFilter(f as any)}
            className={`px-3 py-1 text-[12px] rounded-lg border transition-colors ${
              tagFilter === f
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >{f}</button>
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
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Telefone</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tag</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-[13px] text-gray-400">Nenhum contato encontrado.</td></tr>
              )}
              {filtered.map((c, i) => (
                <tr key={c.email + i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                        {c.initials}
                      </div>
                      <span className="font-medium text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.company}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email}</td>
                  <td className="px-4 py-3 text-gray-500">{c.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${TAG_COLORS[c.tag]}`}>
                      {c.tag}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.score}%` }} />
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

      {/* Modal Novo Contato */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-semibold text-gray-800">Novo Contato</h2>
              <button onClick={closeModal} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">✕</button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">
              {fErr && <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{fErr}</p>}

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Nome *</label>
                <input className={INPUT} placeholder="Nome completo" value={fName} onChange={(e) => setFName(e.target.value)} />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Empresa</label>
                <input className={INPUT} placeholder="Nome da empresa" value={fCompany} onChange={(e) => setFCompany(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">E-mail *</label>
                  <input type="email" className={INPUT} placeholder="email@exemplo.com" value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Telefone</label>
                  <input type="tel" className={INPUT} placeholder="(11) 9 0000-0000" value={fPhone} onChange={(e) => setFPhone(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Classificação</label>
                <div className="flex gap-2">
                  {(['Lead', 'Prospect', 'Cliente', 'Inativo'] as Tag[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFTag(t)}
                      className={`flex-1 py-1.5 text-[12px] rounded-lg border font-medium transition-colors ${
                        fTag === t ? TAG_COLORS[t] + ' border-current' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <button onClick={closeModal} className="px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleAdd} className="px-5 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
                Criar Contato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
