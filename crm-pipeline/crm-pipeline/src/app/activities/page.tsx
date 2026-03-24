'use client'
// src/app/activities/page.tsx — Atividades

import { useState } from 'react'

const ACTIVITY_TYPES = [
  { value: '📞', label: 'Ligação'    },
  { value: '✉️', label: 'E-mail'     },
  { value: '🤝', label: 'Reunião'    },
  { value: '📋', label: 'Follow-up'  },
  { value: '📌', label: 'Tarefa'     },
]

type Status = 'pending' | 'scheduled' | 'done'

interface Activity {
  type:    string
  title:   string
  company: string
  deal:    string
  date:    string
  status:  Status
}

const INITIAL: Activity[] = [
  { type: '📞', title: 'Ligação com Ana Martins',      company: 'TechBrasil',       date: 'Hoje, 10:00',   status: 'pending',   deal: 'Renovação Enterprise' },
  { type: '✉️', title: 'Enviar proposta para Rafael',   company: 'Inovação Digital', date: 'Hoje, 14:00',   status: 'pending',   deal: 'Plano Starter'        },
  { type: '🤝', title: 'Reunião de onboarding Nexus',  company: 'Nexus Soluções',   date: 'Amanhã, 09:30', status: 'scheduled', deal: 'Implementação Pro'    },
  { type: '📋', title: 'Follow-up DataFlow',           company: 'DataFlow',         date: 'Amanhã, 15:00', status: 'scheduled', deal: 'Licença Anual'        },
  { type: '📞', title: 'Demo CloudBR',                 company: 'CloudBR',          date: 'Sex, 11:00',    status: 'scheduled', deal: 'Infraestrutura Cloud' },
  { type: '✅', title: 'Contrato assinado TechBrasil', company: 'TechBrasil',       date: 'Ontem, 16:30',  status: 'done',      deal: 'Plano Premium'        },
  { type: '✅', title: 'Proposta aprovada Nexus',      company: 'Nexus',            date: 'Ontem, 09:00',  status: 'done',      deal: 'Consultoria Anual'    },
]

const STATUS_STYLE: Record<Status, string> = {
  pending:   'bg-amber-100 text-amber-700',
  scheduled: 'bg-blue-100 text-blue-700',
  done:      'bg-emerald-100 text-emerald-700',
}
const STATUS_LABEL: Record<Status, string> = {
  pending:   'Pendente',
  scheduled: 'Agendado',
  done:      'Concluído',
}

const INPUT = 'w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400 transition bg-white'

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>(INITIAL)
  const [filter,     setFilter]     = useState<'all' | Status>('all')
  const [modalOpen,  setModalOpen]  = useState(false)

  // Form state
  const [fType,    setFType]    = useState('📞')
  const [fTitle,   setFTitle]   = useState('')
  const [fCompany, setFCompany] = useState('')
  const [fDeal,    setFDeal]    = useState('')
  const [fDate,    setFDate]    = useState('')
  const [fTime,    setFTime]    = useState('')
  const [fStatus,  setFStatus]  = useState<Status>('scheduled')
  const [fErr,     setFErr]     = useState('')

  const filtered = activities.filter((a) => filter === 'all' || a.status === filter)

  function handleAdd() {
    if (!fTitle.trim()) { setFErr('Título é obrigatório'); return }
    const dateStr = fDate
      ? `${new Date(fDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}${fTime ? `, ${fTime}` : ''}`
      : 'Sem data'
    setActivities((prev) => [{
      type:    fType,
      title:   fTitle.trim(),
      company: fCompany.trim(),
      deal:    fDeal.trim(),
      date:    dateStr,
      status:  fStatus,
    }, ...prev])
    setModalOpen(false)
    setFTitle(''); setFCompany(''); setFDeal(''); setFDate(''); setFTime(''); setFErr('')
  }

  function markDone(i: number) {
    setActivities((prev) => prev.map((a, idx) => idx === i ? { ...a, status: 'done', type: '✅' } : a))
  }

  const tabs: { label: string; value: 'all' | Status }[] = [
    { label: 'Todas',      value: 'all'       },
    { label: 'Pendentes',  value: 'pending'   },
    { label: 'Agendadas',  value: 'scheduled' },
    { label: 'Concluídas', value: 'done'      },
  ]

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-gray-900">Atividades</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">{activities.filter(a => a.status !== 'done').length} atividades em aberto</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Nova Atividade
        </button>
      </div>

      {/* Tabs de filtro */}
      <div className="px-6 py-3 bg-white border-b border-gray-100 flex gap-4">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`text-[13px] pb-2 border-b-2 transition-colors ${
              filter === t.value
                ? 'border-emerald-500 text-emerald-700 font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-auto p-6 space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-[13px] text-gray-400 mt-10">Nenhuma atividade nesta categoria.</p>
        )}
        {filtered.map((a, i) => (
          <div
            key={i}
            className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-colors ${
              a.status === 'done' ? 'opacity-60 border-gray-100' : 'border-gray-100 hover:border-emerald-200'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-[18px] shrink-0">
              {a.type}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-medium text-gray-800 ${a.status === 'done' ? 'line-through' : ''}`}>
                {a.title}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                {[a.company, a.deal].filter(Boolean).join(' · ')}
              </p>
            </div>
            <p className="text-[12px] text-gray-400 shrink-0">{a.date}</p>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLE[a.status]}`}>
              {STATUS_LABEL[a.status]}
            </span>
            {a.status !== 'done' && (
              <button
                onClick={() => markDone(activities.indexOf(a))}
                className="text-[11px] px-2 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-400 transition-colors shrink-0"
                title="Marcar como concluído"
              >✓</button>
            )}
          </div>
        ))}
      </div>

      {/* Modal Nova Atividade */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-semibold text-gray-800">Nova Atividade</h2>
              <button
                onClick={() => { setModalOpen(false); setFErr('') }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >✕</button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">
              {fErr && <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{fErr}</p>}

              {/* Tipo */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-2">Tipo</label>
                <div className="flex gap-2">
                  {ACTIVITY_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setFType(t.value)}
                      title={t.label}
                      className={`flex-1 py-2 rounded-lg border text-[18px] transition-colors ${
                        fType === t.value ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >{t.value}</button>
                  ))}
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Título *</label>
                <input className={INPUT} placeholder="Ex: Ligar para cliente X" value={fTitle} onChange={(e) => setFTitle(e.target.value)} />
              </div>

              {/* Empresa + Negócio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Empresa</label>
                  <input className={INPUT} placeholder="Nome da empresa" value={fCompany} onChange={(e) => setFCompany(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Negócio</label>
                  <input className={INPUT} placeholder="Nome do negócio" value={fDeal} onChange={(e) => setFDeal(e.target.value)} />
                </div>
              </div>

              {/* Data + Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Data</label>
                  <input type="date" className={INPUT} value={fDate} onChange={(e) => setFDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Hora</label>
                  <input type="time" className={INPUT} value={fTime} onChange={(e) => setFTime(e.target.value)} />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Status</label>
                <select className={INPUT} value={fStatus} onChange={(e) => setFStatus(e.target.value as Status)}>
                  <option value="scheduled">Agendado</option>
                  <option value="pending">Pendente</option>
                  <option value="done">Concluído</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => { setModalOpen(false); setFErr('') }}
                className="px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >Cancelar</button>
              <button
                onClick={handleAdd}
                className="px-5 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >Criar Atividade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
