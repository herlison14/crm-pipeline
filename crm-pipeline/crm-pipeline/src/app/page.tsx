// src/app/page.tsx — Dashboard
import { createClient } from '@supabase/supabase-js'

export const metadata = { title: 'Dashboard · CRM Pro' }
export const dynamic = 'force-dynamic'

function getSupabase() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

async function getDashboardData() {
  const sb = getSupabase()
  if (!sb) return null

  const [{ data: deals }, { data: stages }] = await Promise.all([
    sb.from('deals').select('id,title,value,status,stage_id,probability,expected_close_date,created_at,updated_at,lost_reason,owner_name'),
    sb.from('stages').select('id,name,position,color').order('position'),
  ])

  if (!deals || !stages) return null

  const open = deals.filter((d) => d.status === 'open')
  const won  = deals.filter((d) => d.status === 'won')
  const lost = deals.filter((d) => d.status === 'lost')

  const pipelineValue = open.reduce((s, d) => s + (d.value || 0), 0)
  const wonValue      = won.reduce((s, d)  => s + (d.value || 0), 0)
  const avgTicket     = won.length ? wonValue / won.length : 0

  // Ciclo médio de vendas (won deals)
  const cycles = won
    .filter((d) => d.created_at && d.updated_at)
    .map((d) => (new Date(d.updated_at).getTime() - new Date(d.created_at).getTime()) / 86400000)
  const avgCycle = cycles.length ? Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length) : 0

  // Taxa de conversão
  const convRate = deals.length ? Math.round((won.length / deals.length) * 100) : 0

  // Funil: deals por stage
  const funnel = stages.map((s) => ({
    ...s,
    count: deals.filter((d) => d.stage_id === s.id).length,
    value: deals.filter((d) => d.stage_id === s.id).reduce((sum, d) => sum + (d.value || 0), 0),
  }))
  const maxCount = Math.max(...funnel.map((f) => f.count), 1)

  // Fechando em 7 dias
  const in7days = open.filter((d) => {
    if (!d.expected_close_date) return false
    const diff = (new Date(d.expected_close_date).getTime() - Date.now()) / 86400000
    return diff >= 0 && diff <= 7
  })

  // Motivos de perda
  const lostReasons: Record<string, number> = {}
  lost.forEach((d) => {
    const r = d.lost_reason || 'Não informado'
    lostReasons[r] = (lostReasons[r] || 0) + 1
  })

  // Revenue Intelligence — forecast ponderado por probabilidade
  const now = Date.now()
  const MS_30 = 30 * 86400000
  const MS_60 = 60 * 86400000
  const MS_90 = 90 * 86400000

  function weightedValue(deals: any[]) {
    return deals.reduce((s: number, d: any) => s + (d.value || 0) * ((d.probability || 50) / 100), 0)
  }

  const bucket30 = open.filter((d: any) => {
    if (!d.expected_close_date) return false
    const diff = new Date(d.expected_close_date).getTime() - now
    return diff >= 0 && diff <= MS_30
  })
  const bucket60 = open.filter((d: any) => {
    if (!d.expected_close_date) return false
    const diff = new Date(d.expected_close_date).getTime() - now
    return diff > MS_30 && diff <= MS_60
  })
  const bucket90 = open.filter((d: any) => {
    if (!d.expected_close_date) return false
    const diff = new Date(d.expected_close_date).getTime() - now
    return diff > MS_60 && diff <= MS_90
  })

  const w30 = weightedValue(bucket30)
  const w60 = weightedValue(bucket60)
  const w90 = weightedValue(bucket90)

  // Acumulado (30 inclui deals que fecham até 30 dias, 60 = até 60, etc.)
  const forecast = {
    d30: { weighted: w30, count: bucket30.length, pess: w30 * 0.7, opt: w30 * 1.3 },
    d60: { weighted: w30 + w60, count: bucket30.length + bucket60.length, pess: (w30 + w60) * 0.7, opt: (w30 + w60) * 1.3 },
    d90: { weighted: w30 + w60 + w90, count: bucket30.length + bucket60.length + bucket90.length, pess: (w30 + w60 + w90) * 0.7, opt: (w30 + w60 + w90) * 1.3 },
  }

  // Meta mensal estimada = média dos valores ganhos * 1.2 (meta de crescimento 20%)
  const monthlyTarget = avgTicket > 0 ? avgTicket * (won.length || 1) * 1.2 : pipelineValue * 0.3

  return { open, won, lost, pipelineValue, wonValue, avgTicket, avgCycle, convRate, funnel, maxCount, in7days, lostReasons, forecast, monthlyTarget, bucket30 }
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <h1 className="text-[16px] font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex items-center justify-center flex-1 text-gray-400 text-[13px]">
          Configure as variáveis de ambiente do Supabase para ver as métricas.
        </div>
      </div>
    )
  }

  const { open, won, lost, pipelineValue, wonValue, avgTicket, avgCycle, convRate, funnel, maxCount, in7days, lostReasons, forecast, monthlyTarget, bucket30 } = data

  const kpis = [
    { label: 'Pipeline em aberto',   value: fmt(pipelineValue), sub: `${open.length} negócios`,        color: 'text-blue-700',    bg: 'bg-blue-50'    },
    { label: 'Receita ganha',         value: fmt(wonValue),       sub: `${won.length} fechamentos`,      color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Taxa de conversão',     value: `${convRate}%`,      sub: `${lost.length} perdidos`,        color: 'text-violet-700',  bg: 'bg-violet-50'  },
    { label: 'Ticket médio (ganhos)', value: fmt(avgTicket),      sub: `Ciclo médio: ${avgCycle} dias`,  color: 'text-amber-700',   bg: 'bg-amber-50'   },
  ]

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-gray-900">Dashboard</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · {open.length + won.length + lost.length} negócios totais
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className={`${k.bg} rounded-xl p-4`}>
              <p className="text-[11px] font-medium text-gray-500">{k.label}</p>
              <p className={`text-[22px] font-bold mt-1 ${k.color}`}>{k.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-5">

          {/* Funil de vendas */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-[14px] font-semibold text-gray-700 mb-4">Funil de Vendas</h2>
            <div className="space-y-3">
              {funnel.map((f, i) => {
                const pct = maxCount > 0 ? Math.round((f.count / maxCount) * 100) : 0
                const convPct = i < funnel.length - 1 && funnel[i + 1]
                  ? funnel[i].count > 0 ? Math.round((funnel[i + 1].count / funnel[i].count) * 100) : 0
                  : null
                return (
                  <div key={f.id}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="w-24 text-right text-[12px] text-gray-500 shrink-0">{f.name}</span>
                      <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full rounded-lg flex items-center px-3 transition-all"
                          style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: f.color }}
                        >
                          <span className="text-[11px] text-white font-medium">{f.count}</span>
                        </div>
                      </div>
                      <span className="w-20 text-[11px] text-gray-400 shrink-0">{fmt(f.value)}</span>
                    </div>
                    {convPct !== null && (
                      <div className="flex items-center gap-3">
                        <span className="w-24" />
                        <span className="text-[10px] text-gray-300 pl-2">↓ {convPct}% avançam</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Painel direito */}
          <div className="flex flex-col gap-4">

            {/* Fechando em 7 dias */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex-1">
              <h2 className="text-[13px] font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <span>⏰</span> Fechando em 7 dias
              </h2>
              {in7days.length === 0 ? (
                <p className="text-[12px] text-gray-400">Nenhum negócio no período.</p>
              ) : (
                <div className="space-y-2">
                  {in7days.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-gray-700 truncate">{d.title}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(d.expected_close_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          {d.owner_name ? ` · ${d.owner_name}` : ''}
                        </p>
                      </div>
                      <span className="text-[12px] font-semibold text-emerald-700 ml-2 shrink-0">{fmt(d.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Motivos de perda */}
            {lost.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h2 className="text-[13px] font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <span>📉</span> Motivos de Perda
                </h2>
                <div className="space-y-2">
                  {Object.entries(lostReasons).slice(0, 4).map(([reason, count]) => (
                    <div key={reason} className="flex items-center justify-between">
                      <span className="text-[12px] text-gray-500 truncate flex-1">{reason}</span>
                      <span className="text-[12px] font-semibold text-red-500 ml-2">{count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Revenue Intelligence */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-700 flex items-center gap-2">
                <span>📈</span> Revenue Intelligence · Forecast Ponderado
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Baseado em probabilidade × valor dos negócios em aberto</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Meta mensal est.</p>
              <p className="text-[16px] font-bold text-emerald-700">{fmt(monthlyTarget)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-5">
            {([
              { label: 'Próximos 30 dias', key: 'd30', color: 'emerald' },
              { label: 'Próximos 60 dias', key: 'd60', color: 'blue' },
              { label: 'Próximos 90 dias', key: 'd90', color: 'violet' },
            ] as const).map(({ label, key, color }) => {
              const f = forecast[key]
              const progressPct = Math.min(Math.round((f.weighted / monthlyTarget) * 100), 100)
              const colorMap = {
                emerald: { bar: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', light: 'bg-emerald-100' },
                blue:    { bar: 'bg-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700',    light: 'bg-blue-100'    },
                violet:  { bar: 'bg-violet-500',  bg: 'bg-violet-50',  text: 'text-violet-700',  light: 'bg-violet-100'  },
              }
              const c = colorMap[color]
              return (
                <div key={key} className={`${c.bg} rounded-xl p-4`}>
                  <p className="text-[11px] font-medium text-gray-500 mb-1">{label}</p>
                  <p className={`text-[20px] font-bold ${c.text}`}>{fmt(f.weighted)}</p>
                  <p className="text-[10px] text-gray-400 mb-3">{f.count} negócio{f.count !== 1 ? 's' : ''} no período</p>

                  {/* Barra de progresso em relação à meta */}
                  <div className="h-1.5 bg-white rounded-full overflow-hidden mb-1">
                    <div className={`h-full ${c.bar} rounded-full transition-all`} style={{ width: `${progressPct}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400">{progressPct}% da meta</p>

                  {/* Cenários pessimista / otimista */}
                  <div className="flex gap-2 mt-3">
                    <div className={`flex-1 rounded-lg px-2 py-1.5 ${c.light} text-center`}>
                      <p className="text-[9px] text-gray-400 font-medium">Pessimista</p>
                      <p className={`text-[11px] font-bold ${c.text}`}>{fmt(f.pess)}</p>
                    </div>
                    <div className={`flex-1 rounded-lg px-2 py-1.5 ${c.light} text-center`}>
                      <p className="text-[9px] text-gray-400 font-medium">Otimista</p>
                      <p className={`text-[11px] font-bold ${c.text}`}>{fmt(f.opt)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Deals de maior impacto no forecast 30d */}
          {bucket30.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Maiores oportunidades · 30 dias</p>
              <div className="space-y-1.5">
                {[...bucket30]
                  .sort((a: any, b: any) => ((b.value || 0) * (b.probability || 50)) - ((a.value || 0) * (a.probability || 50)))
                  .slice(0, 4)
                  .map((d: any) => {
                    const weighted = (d.value || 0) * ((d.probability || 50) / 100)
                    return (
                      <div key={d.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-gray-700 truncate">{d.title}</p>
                          <p className="text-[10px] text-gray-400">
                            Fecha: {new Date(d.expected_close_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            {d.owner_name ? ` · ${d.owner_name}` : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[12px] font-semibold text-gray-700">{fmt(d.value || 0)}</p>
                          <p className="text-[10px] text-emerald-600 font-medium">≈ {fmt(weighted)} ponderado</p>
                        </div>
                        <div className="w-10 text-center shrink-0">
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                            (d.probability || 50) >= 70 ? 'bg-emerald-100 text-emerald-700' :
                            (d.probability || 50) >= 40 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-600'
                          }`}>{d.probability || 50}%</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
