'use client'
// src/app/activities/page.tsx — Atividades

import { useState, useEffect } from 'react'

const ACTIVITY_TYPES = [
  { value: '📞', label: 'Ligação'   },
  { value: '✉️', label: 'E-mail'    },
  { value: '🤝', label: 'Reunião'   },
  { value: '📋', label: 'Follow-up' },
  { value: '📌', label: 'Tarefa'    },
]

type Status = 'pending' | 'scheduled' | 'done'

interface Activity {
  type:    string
  title:   string
  company: string
  deal:    string
  date:    string      // label de exibição
  dueIso:  string      // ISO datetime para comparação real
  status:  Status
}

// Helpers para montar datas relativas
function isoFromNow(offsetDays: number, hour: number, min: number) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}

const INITIAL: Activity[] = [
  // Vencidas (ontem)
  { type: '📋', title: 'Follow-up DataFlow',            company: 'DataFlow',         deal: 'Licença Anual',        date: 'Ontem, 15:00', dueIso: isoFromNow(-1, 15, 0),  status: 'pending'   },
  { type: '📞', title: 'Ligar para Ricardo - proposta', company: 'Visão Digital',    deal: 'CRM Enterprise',       date: 'Ontem, 10:30', dueIso: isoFromNow(-1, 10, 30), status: 'scheduled' },
  // Hoje (podem ou não estar vencidas conforme a hora atual)
  { type: '📞', title: 'Ligação com Ana Martins',       company: 'TechBrasil',       deal: 'Renovação Enterprise', date: 'Hoje, 10:00',  dueIso: isoFromNow(0,  10, 0),  status: 'pending'   },
  { type: '✉️', title: 'Enviar proposta para Rafael',   company: 'Inovação Digital', deal: 'Plano Starter',        date: 'Hoje, 14:00',  dueIso: isoFromNow(0,  14, 0),  status: 'pending'   },
  // Futuras
  { type: '🤝', title: 'Reunião de onboarding Nexus',  company: 'Nexus Soluções',   deal: 'Implementação Pro',    date: 'Amanhã, 09:30',dueIso: isoFromNow(1,  9, 30),  status: 'scheduled' },
  { type: '📞', title: 'Demo CloudBR',                 company: 'CloudBR',          deal: 'Infraestrutura Cloud', date: 'Em 3 dias',    dueIso: isoFromNow(3,  11, 0),  status: 'scheduled' },
  // Concluídas
  { type: '✅', title: 'Contrato assinado TechBrasil', company: 'TechBrasil',       deal: 'Plano Premium',        date: 'Ontem, 16:30', dueIso: isoFromNow(-1, 16, 30), status: 'done'      },
  { type: '✅', title: 'Proposta aprovada Nexus',      company: 'Nexus',            deal: 'Consultoria Anual',    date: 'Ontem, 09:00', dueIso: isoFromNow(-1, 9,  0),  status: 'done'      },
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

function isOverdue(a: Activity) {
  if (a.status === 'done') return false
  return new Date(a.dueIso) < new Date()
}

export default function ActivitiesPage() {
  const [activities,    setActivities]    = useState<Activity[]>(INITIAL)
  const [filter,        setFilter]        = useState<'all' | Status | 'overdue'>('all')
  const [modalOpen,     setModalOpen]     = useState(false)
  const [alertDismiss,  setAlertDismiss]  = useState(false)
  const [now,           setNow]           = useState(() => new Date())

  // Atualiza "now" a cada minuto para recalcular vencidas em tempo real
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const overdue = activities.filter(isOverdue)

  const filtered = activities.filter((a) => {
    if (filter === 'overdue') return isOverdue(a)
    if (filter === 'all')     return true
    return a.status === filter
  })

  // Form state
  const [fType,    setFType]    = useState('📞')
  const [fTitle,   setFTitle]   = useState('')
  const [fCompany, setFCompany] = useState('')
  const [fDeal,    setFDeal]    = useState('')
  const [fDate,    setFDate]    = useState('')
  const [fTime,    setFTime]    = useState('')
  const [fStatus,  setFStatus]  = useState<Status>('scheduled')
  const [fErr,     setFErr]     = useState('')

  function handleAdd() {
    if (!fTitle.trim()) { setFErr('Título é obrigatório'); return }
    const dueIso = fDate
      ? new Date(`${fDate}T${fTime || '09:00'}:00`).toISOString()
      : new Date().toISOString()
    const dateStr = fDate
      ? `${new Date(fDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}${fTime ? `, ${fTime}` : ''}`
      : 'Sem data'
    setActivities((prev) => [{
      type: fType, title: fTitle.trim(), company: fCompany.trim(),
      deal: fDeal.trim(), date: dateStr, dueIso, status: fStatus,
    }, ...prev])
    setModalOpen(false)
    setFTitle(''); setFCompany(''); setFDeal(''); setFDate(''); setFTime(''); setFErr('')
  }

  function markDone(idx: number) {
    setActivities((prev) => prev.map((a, i) => i === idx ? { ...a, status: 'done', type: '✅' } : a))
  }

  const tabs: { label: string; value: typeof filter; danger?: boolean }[] = [
    { label: 'Todas',      value: 'all'       },
    { label: 'Vencidas',   value: 'overdue',  danger: true },
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
          <p className="text-[12px] text-gray-400 mt-0.5">
            {activities.filter((a) => a.status !== 'done').length} em aberto
            {overdue.length > 0 && (
              <span className="ml-2 text-red-500 font-semibold">· {overdue.length} vencida{overdue.length > 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Nova Atividade
        </button>
      </div>

      {/* Banner de alerta — atividades vencidas */}
      {overdue.length > 0 && !alertDismiss && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-[18px] shrink-0">⚠️</div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-red-700">
              {overdue.length} atividade{overdue.length > 1 ? 's vencidas' : ' vencida'}
            </p>
            <div className="mt-1 space-y-0.5">
              {overdue.slice(0, 3).map((a, i) => (
                <p key={i} className="text-[12px] text-red-500 truncate">
                  {a.type} {a.title}{a.company ? ` — ${a.company}` : ''}
                </p>
              ))}
              {overdue.length > 3 && (
                <p className="text-[11px] text-red-400">+{overdue.length - 3} mais...</p>
              )}
            </div>
            <button
              onClick={() => setFilter('overdue')}
              className="mt-2 text-[12px] font-medium text-red-600 hover:text-red-800 underline"
            >
              Ver todas as vencidas →
            </button>
          </div>
          <button
            onClick={() => setAlertDismiss(true)}
            className="text-red-300 hover:text-red-500 transition-colors text-[13px] shrink-0"
            title="Fechar alerta"
          >✕</button>
        </div>
      )}

      {/* Tabs de filtro */}
      <div className="px-6 py-3 bg-white border-b border-gray-100 flex gap-4 mt-3">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`text-[13px] pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              filter === t.value
                ? t.danger ? 'border-red-500 text-red-600 font-medium' : 'border-emerald-500 text-emerald-700 font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
            {t.danger && overdue.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">
                {overdue.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-auto p-6 space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-[13px] text-gray-400 mt-10">Nenhuma atividade nesta categoria.</p>
        )}
        {filtered.map((a, i) => {
          const overdueBool = isOverdue(a)
          const realIdx     = activities.indexOf(a)
          return (
            <div
              key={i}
              className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all ${
                a.status === 'done'
                  ? 'opacity-60 border-gray-100'
                  : overdueBool
                  ? 'border-red-300 bg-red-50/40 shadow-sm'
                  : 'border-gray-100 hover:border-emerald-200'
              }`}
            >
              {/* Ícone */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[18px] shrink-0 ${overdueBool ? 'bg-red-100' : 'bg-gray-50'}`}>
                {overdueBool ? '⚠️' : a.type}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-[13px] font-medium ${a.status === 'done' ? 'line-through text-gray-400' : overdueBool ? 'text-red-700' : 'text-gray-800'}`}>
                    {a.title}
                  </p>
                  {overdueBool && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold shrink-0">
                      VENCIDA
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  {[a.company, a.deal].filter(Boolean).join(' · ')}
                </p>
              </div>

              <p className={`text-[12px] shrink-0 ${overdueBool ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                {a.date}
              </p>

              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                overdueBool ? 'bg-red-100 text-red-700' : STATUS_STYLE[a.status]
              }`}>
                {overdueBool ? 'Vencida' : STATUS_LABEL[a.status]}
              </span>

              {a.status !== 'done' && (
                <button
                  onClick={() => markDone(realIdx)}
                  className={`text-[11px] px-2 py-1 rounded-lg transition-colors shrink-0 ${
                    overdueBool
                      ? 'bg-red-100 hover:bg-emerald-50 text-red-400 hover:text-emerald-700'
                      : 'bg-gray-100 hover:bg-emerald-50 text-gray-400 hover:text-emerald-700'
                  }`}
                  title="Marcar como concluído"
                >✓</button>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal Nova Atividade */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-semibold text-gray-800">Nova Atividade</h2>
              <button onClick={() => { setModalOpen(false); setFErr('') }} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">✕</button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">
              {fErr && <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{fErr}</p>}

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-2">Tipo</label>
                <div className="flex gap-2">
                  {ACTIVITY_TYPES.map((t) => (
                    <button key={t.value} onClick={() => setFType(t.value)} title={t.label}
                      className={`flex-1 py-2 rounded-lg border text-[18px] transition-colors ${fType === t.value ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >{t.value}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Título *</label>
                <input className={INPUT} placeholder="Ex: Ligar para cliente X" value={fTitle} onChange={(e) => setFTitle(e.target.value)} />
              </div>

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
              <button onClick={() => { setModalOpen(false); setFErr('') }} className="px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleAdd} className="px-5 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">Criar Atividade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
