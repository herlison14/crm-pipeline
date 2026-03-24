'use client'
// src/app/automations/page.tsx — Automações

import { useState, useEffect, useCallback } from 'react'
import { supabase, supabaseConfigured, formatCurrency } from '@/lib/supabase'
import type { Deal, Stage } from '@/types/crm'

// ─── Tipos ────────────────────────────────────────────────────
interface AutomationRule {
  id:          string
  icon:        string
  name:        string
  description: string
  category:    'risco' | 'oportunidade' | 'gestao'
  active:      boolean
  threshold:   number
  thresholdLabel: string
  runs:        number
}

// ─── Regras padrão ────────────────────────────────────────────
const DEFAULT_RULES: AutomationRule[] = [
  {
    id: 'stalled',       icon: '🕐', category: 'risco',
    name: 'Negócio parado',
    description: 'Deals sem movimentação por mais de N dias',
    active: true, threshold: 7, thresholdLabel: 'dias sem movimento', runs: 0,
  },
  {
    id: 'proposal',      icon: '📄', category: 'risco',
    name: 'Proposta sem resposta',
    description: 'Deals em "Proposta" sem avançar por N dias',
    active: true, threshold: 5, thresholdLabel: 'dias em Proposta', runs: 0,
  },
  {
    id: 'overdue_action', icon: '⚠️', category: 'risco',
    name: 'Ação vencida em deal ativo',
    description: 'Deals com próxima ação atrasada',
    active: true, threshold: 0, thresholdLabel: 'dias de atraso', runs: 0,
  },
  {
    id: 'no_action',     icon: '📭', category: 'risco',
    name: 'Deal sem próxima ação',
    description: 'Negócios em aberto sem follow-up agendado',
    active: true, threshold: 0, thresholdLabel: '', runs: 0,
  },
  {
    id: 'hot_leads',     icon: '🔥', category: 'oportunidade',
    name: 'Hot leads — fechar agora',
    description: 'Deals com probabilidade ≥ N% fechando em 30 dias',
    active: true, threshold: 70, thresholdLabel: '% de probabilidade mínima', runs: 0,
  },
  {
    id: 'high_value',    icon: '💰', category: 'oportunidade',
    name: 'Alto valor sem responsável',
    description: 'Deals acima de R$ N sem vendedor atribuído',
    active: true, threshold: 30000, thresholdLabel: 'valor mínimo (R$)', runs: 0,
  },
  {
    id: 'closing_week',  icon: '📅', category: 'oportunidade',
    name: 'Fechamento esta semana',
    description: 'Deals com data de fechamento nos próximos 7 dias',
    active: true, threshold: 7, thresholdLabel: 'dias para fechamento', runs: 0,
  },
  {
    id: 'seller_rank',   icon: '🏆', category: 'gestao',
    name: 'Ranking de vendedores',
    description: 'Classificação por valor ganho no mês atual',
    active: true, threshold: 0, thresholdLabel: '', runs: 0,
  },
  {
    id: 'conversion',    icon: '📊', category: 'gestao',
    name: 'Alerta de conversão baixa',
    description: 'Etapas com taxa de avanço abaixo de N%',
    active: true, threshold: 30, thresholdLabel: '% de conversão mínima', runs: 0,
  },
  {
    id: 'lost_analysis', icon: '📉', category: 'gestao',
    name: 'Análise de perdas',
    description: 'Consolidação dos motivos de deals perdidos',
    active: true, threshold: 0, thresholdLabel: '', runs: 0,
  },
]

const CATEGORY_LABEL: Record<string, string> = {
  risco:       '🔴 Riscos & Alertas',
  oportunidade:'🟢 Oportunidades',
  gestao:      '🔵 Gestão & Análise',
}
const CATEGORY_BG: Record<string, string> = {
  risco:       'bg-red-50 border-red-200',
  oportunidade:'bg-emerald-50 border-emerald-200',
  gestao:      'bg-blue-50 border-blue-200',
}

// ─── Lógica das automações ────────────────────────────────────
function runAutomations(deals: Deal[], stages: Stage[], rules: AutomationRule[]) {
  const now    = new Date()
  const results: Record<string, Deal[] | any[]> = {}

  const cutoff = (days: number) => new Date(now.getTime() - days * 86400000)
  const inDays = (days: number) => new Date(now.getTime() + days * 86400000).toISOString().split('T')[0]
  const open   = deals.filter((d) => d.status === 'open')

  for (const rule of rules) {
    if (!rule.active) { results[rule.id] = []; continue }

    if (rule.id === 'stalled') {
      results[rule.id] = open.filter((d) => new Date(d.updated_at) < cutoff(rule.threshold))
    }
    else if (rule.id === 'proposal') {
      const s = stages.find((st) => st.name.toLowerCase().includes('proposta'))
      results[rule.id] = s
        ? open.filter((d) => d.stage_id === s.id && new Date(d.updated_at) < cutoff(rule.threshold))
        : []
    }
    else if (rule.id === 'overdue_action') {
      results[rule.id] = open.filter((d) =>
        d.next_action_date && new Date(d.next_action_date + 'T23:59:59') < now
      )
    }
    else if (rule.id === 'no_action') {
      results[rule.id] = open.filter((d) => !d.next_action)
    }
    else if (rule.id === 'hot_leads') {
      const horizon = inDays(30)
      results[rule.id] = open.filter((d) =>
        d.probability >= rule.threshold &&
        d.expected_close_date &&
        d.expected_close_date <= horizon
      )
    }
    else if (rule.id === 'high_value') {
      results[rule.id] = open.filter((d) => d.value >= rule.threshold && !d.owner_name)
    }
    else if (rule.id === 'closing_week') {
      const horizon = inDays(rule.threshold)
      const today   = now.toISOString().split('T')[0]
      results[rule.id] = open.filter((d) =>
        d.expected_close_date && d.expected_close_date >= today && d.expected_close_date <= horizon
      )
    }
    else if (rule.id === 'seller_rank') {
      const map: Record<string, { won: number; value: number; color: string }> = {}
      deals.filter((d) => d.status === 'won').forEach((d) => {
        const k = d.owner_name || 'Sem responsável'
        if (!map[k]) map[k] = { won: 0, value: 0, color: d.owner_color }
        map[k].won++
        map[k].value += d.value
      })
      results[rule.id] = Object.entries(map)
        .sort((a, b) => b[1].value - a[1].value)
        .map(([name, data], i) => ({ rank: i + 1, name, ...data }))
    }
    else if (rule.id === 'conversion') {
      const convData = stages.map((s, i) => {
        const inStage = deals.filter((d) => d.stage_id === s.id).length
        const nextStage = stages[i + 1]
        const inNext  = nextStage ? deals.filter((d) => d.stage_id === nextStage.id).length : null
        const pct     = inStage > 0 && inNext !== null ? Math.round((inNext / inStage) * 100) : null
        return { stage: s.name, count: inStage, pct, low: pct !== null && pct < rule.threshold }
      }).filter((s) => s.low)
      results[rule.id] = convData
    }
    else if (rule.id === 'lost_analysis') {
      const map: Record<string, number> = {}
      deals.filter((d) => d.status === 'lost').forEach((d) => {
        const r = d.lost_reason || 'Não informado'
        map[r] = (map[r] || 0) + 1
      })
      results[rule.id] = Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .map(([reason, count]) => ({ reason, count }))
    }
  }
  return results
}

// ─── Componente ───────────────────────────────────────────────
export default function AutomationsPage() {
  const [rules,     setRules]     = useState<AutomationRule[]>(DEFAULT_RULES)
  const [deals,     setDeals]     = useState<Deal[]>([])
  const [stages,    setStages]    = useState<Stage[]>([])
  const [loading,   setLoading]   = useState(true)
  const [expanded,  setExpanded]  = useState<string | null>(null)
  const [editing,   setEditing]   = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newName,   setNewName]   = useState('')
  const [results,   setResults]   = useState<Record<string, any[]>>({})

  // Carregar dados
  useEffect(() => {
    if (!supabaseConfigured) { setLoading(false); return }
    ;(async () => {
      const [{ data: d }, { data: s }] = await Promise.all([
        supabase.from('deals').select('*').order('created_at'),
        supabase.from('stages').select('*').order('position'),
      ])
      setDeals(d ?? [])
      setStages(s ?? [])
      setLoading(false)
    })()
  }, [])

  // Recalcular automações sempre que dados ou regras mudam
  useEffect(() => {
    setResults(runAutomations(deals, stages, rules))
  }, [deals, stages, rules])

  function toggle(id: string) {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r))
  }
  function updateThreshold(id: string, val: number) {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, threshold: val } : r))
  }

  const activeCount  = rules.filter((r) => r.active).length
  const alertCount   = Object.values(results).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0)
  const riskCount    = rules.filter((r) => r.category === 'risco' && r.active)
    .reduce((s, r) => s + (results[r.id]?.length ?? 0), 0)

  const categories = ['risco', 'oportunidade', 'gestao'] as const

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-gray-900">Automações</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {activeCount} ativas · {alertCount} alertas
            {riskCount > 0 && <span className="text-red-500 font-semibold"> · {riskCount} risco{riskCount > 1 ? 's' : ''}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <span className="text-[12px] text-gray-400">Analisando pipeline...</span>}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
          >
            <span className="text-base leading-none">+</span> Nova Automação
          </button>
        </div>
      </div>

      {/* Resumo de alertas críticos */}
      {riskCount > 0 && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-[20px]">🚨</span>
          <p className="text-[13px] font-semibold text-red-700">
            {riskCount} alerta{riskCount > 1 ? 's' : ''} de risco no pipeline — verifique as automações abaixo
          </p>
        </div>
      )}

      {/* Lista por categoria */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {categories.map((cat) => {
          const catRules = rules.filter((r) => r.category === cat)
          return (
            <div key={cat}>
              <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {CATEGORY_LABEL[cat]}
              </p>
              <div className="space-y-2">
                {catRules.map((rule) => {
                  const hits     = results[rule.id] ?? []
                  const isOpen   = expanded === rule.id
                  const isEdit   = editing  === rule.id
                  const hasBadge = hits.length > 0 && rule.active

                  return (
                    <div
                      key={rule.id}
                      className={`bg-white rounded-xl border transition-all ${
                        hasBadge && cat === 'risco'
                          ? 'border-red-200'
                          : hasBadge && cat === 'oportunidade'
                          ? 'border-emerald-200'
                          : 'border-gray-100'
                      }`}
                    >
                      {/* Linha principal */}
                      <div className="flex items-center gap-4 p-4">
                        {/* Toggle */}
                        <button
                          onClick={() => toggle(rule.id)}
                          className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${rule.active ? 'bg-emerald-500' : 'bg-gray-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.active ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>

                        <div className="text-[20px] shrink-0">{rule.icon}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold text-gray-800">{rule.name}</p>
                            {hasBadge && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                cat === 'risco'        ? 'bg-red-100 text-red-600' :
                                cat === 'oportunidade' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-blue-100 text-blue-600'
                              }`}>{hits.length}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{rule.description}</p>

                          {/* Edição de threshold inline */}
                          {isEdit && rule.thresholdLabel && (
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="number"
                                className="w-24 text-[12px] px-2 py-1 border border-emerald-300 rounded-lg outline-none focus:border-emerald-500"
                                value={rule.threshold}
                                onChange={(e) => updateThreshold(rule.id, Number(e.target.value))}
                              />
                              <span className="text-[11px] text-gray-400">{rule.thresholdLabel}</span>
                              <button onClick={() => setEditing(null)} className="text-[11px] text-emerald-600 font-medium">Salvar</button>
                            </div>
                          )}
                          {!isEdit && rule.thresholdLabel && rule.active && (
                            <button
                              onClick={() => setEditing(rule.id)}
                              className="text-[11px] text-gray-400 hover:text-emerald-600 transition-colors mt-0.5"
                            >
                              ⚙ Configurar threshold ({rule.threshold} {rule.thresholdLabel})
                            </button>
                          )}
                        </div>

                        {/* Botão expandir */}
                        {rule.active && hits.length > 0 && (
                          <button
                            onClick={() => setExpanded(isOpen ? null : rule.id)}
                            className="text-[12px] px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors shrink-0"
                          >
                            {isOpen ? '▲ Fechar' : `▼ Ver ${hits.length}`}
                          </button>
                        )}

                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${rule.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                          {rule.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      {/* Resultados expandidos */}
                      {isOpen && hits.length > 0 && (
                        <div className={`border-t px-4 py-3 rounded-b-xl ${CATEGORY_BG[cat]}`}>
                          <ResultList ruleId={rule.id} hits={hits} stages={stages} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Nova Automação */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-semibold text-gray-800">Nova Automação</h2>
              <button onClick={() => setModalOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">✕</button>
            </div>
            <div className="px-5 py-6 text-center text-gray-400 text-[13px]">
              <p className="text-[32px] mb-3">🚧</p>
              <p className="font-medium text-gray-600 mb-1">Automações customizadas em desenvolvimento</p>
              <p>As 10 automações predefinidas já cobrem os principais alertas de vendas. Configurações avançadas de gatilhos e integrações por webhook serão adicionadas em breve.</p>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-[13px] text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">Entendido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Componente de resultados por tipo ───────────────────────
function ResultList({ ruleId, hits, stages }: { ruleId: string; hits: any[]; stages: Stage[] }) {
  const stageMap = Object.fromEntries(stages.map((s) => [s.id, s.name]))

  if (ruleId === 'seller_rank') {
    return (
      <div className="space-y-2">
        {hits.map((h: any) => (
          <div key={h.name} className="flex items-center gap-3">
            <span className="text-[13px] font-bold text-gray-500 w-5">{h.rank}º</span>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: h.color }}>
              {h.name.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <span className="flex-1 text-[13px] font-medium text-gray-700">{h.name}</span>
            <span className="text-[12px] text-gray-500">{h.won} ganho{h.won !== 1 ? 's' : ''}</span>
            <span className="text-[13px] font-semibold text-emerald-700">{formatCurrency(h.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  if (ruleId === 'conversion') {
    return (
      <div className="space-y-2">
        {hits.map((h: any) => (
          <div key={h.stage} className="flex items-center justify-between">
            <span className="text-[13px] text-gray-700">{h.stage} → próxima etapa</span>
            <span className="text-[12px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">{h.pct}% conversão</span>
          </div>
        ))}
      </div>
    )
  }

  if (ruleId === 'lost_analysis') {
    const total = hits.reduce((s: number, h: any) => s + h.count, 0)
    return (
      <div className="space-y-2">
        {hits.map((h: any) => (
          <div key={h.reason} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[12px] text-gray-700 truncate">{h.reason}</span>
                <span className="text-[12px] font-semibold text-red-600 ml-2">{h.count}x · {Math.round(h.count/total*100)}%</span>
              </div>
              <div className="h-1.5 bg-red-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.round(h.count/total*100)}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Deals genéricos
  return (
    <div className="space-y-2">
      {(hits as Deal[]).map((d) => (
        <div key={d.id} className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-gray-800 truncate">{d.title}</p>
            <p className="text-[11px] text-gray-400">
              {stageMap[d.stage_id] ?? '—'}
              {d.owner_name ? ` · ${d.owner_name}` : ''}
              {d.next_action ? ` · ▷ ${d.next_action}` : ''}
            </p>
          </div>
          <span className="text-[12px] font-semibold text-gray-700 shrink-0">{formatCurrency(d.value)}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
            d.probability >= 65 ? 'bg-emerald-100 text-emerald-700' :
            d.probability >= 35 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-600'
          }`}>{d.probability}%</span>
        </div>
      ))}
    </div>
  )
}
