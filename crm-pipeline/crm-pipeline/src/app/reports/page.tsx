'use client'
// src/app/reports/page.tsx — Relatórios

import { useState } from 'react'

const FUNNEL = [
  { stage: 'Prospecção',   count: 48, value: 720000, pct: 100, color: '#3b82f6' },
  { stage: 'Qualificação', count: 32, value: 512000, pct: 67,  color: '#8b5cf6' },
  { stage: 'Proposta',     count: 21, value: 378000, pct: 44,  color: '#f59e0b' },
  { stage: 'Negociação',   count: 11, value: 220000, pct: 23,  color: '#f97316' },
  { stage: 'Fechamento',   count: 6,  value: 132000, pct: 13,  color: '#16a34a' },
]

const KPIS = [
  { label: 'Taxa lead → cliente', value: '12,5%'      },
  { label: 'Ticket médio',        value: 'R$ 22.000'  },
  { label: 'Ciclo médio',         value: '28 dias'    },
  { label: 'Negócios ganhos',     value: '14'         },
  { label: 'Negócios perdidos',   value: '8'          },
  { label: 'Total no funil',      value: 'R$ 1.962.000' },
]

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

function exportCSV() {
  const header = ['Etapa', 'Negócios', 'Valor', 'Conversão (%)']
  const rows = FUNNEL.map((f) => [f.stage, f.count, fmt(f.value), f.pct + '%'])
  const sep = '\t' // tab-separated → Excel abre direto
  const content = [header, ...rows].map((r) => r.join(sep)).join('\n')
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'relatorio-crm.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function exportPDF() {
  window.print()
}

export default function ReportsPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-[16px] font-semibold text-gray-900">Relatórios</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Funil de conversão · {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Dropdown de exportação */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
          >
            ↓ Exportar
            <span className="text-[10px] text-gray-400">▾</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
              <button
                onClick={() => { exportPDF(); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>📄</span> Exportar PDF
              </button>
              <div className="border-t border-gray-50" />
              <button
                onClick={() => { exportCSV(); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>📊</span> Exportar Excel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {KPIS.map((k) => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-[11px] text-gray-400 font-medium">{k.label}</p>
              <p className="text-[22px] font-bold text-gray-900 mt-1">{k.value}</p>
            </div>
          ))}
        </div>

        {/* Funil visual */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-[14px] font-semibold text-gray-700 mb-5">Funil de Vendas</h2>
          <div className="space-y-3">
            {FUNNEL.map((f, i) => {
              const next = FUNNEL[i + 1]
              const convPct = next ? Math.round((next.count / f.count) * 100) : null
              return (
                <div key={f.stage}>
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-right text-[12px] text-gray-500 shrink-0">{f.stage}</div>
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg flex items-center px-3 transition-all"
                        style={{ width: `${Math.max(f.pct, 5)}%`, backgroundColor: f.color }}
                      >
                        <span className="text-[11px] text-white font-medium">{f.count}</span>
                      </div>
                    </div>
                    <div className="w-28 text-[12px] text-gray-500 shrink-0 text-right">{fmt(f.value)}</div>
                  </div>
                  {convPct !== null && (
                    <div className="flex items-center gap-4 my-0.5">
                      <div className="w-24" />
                      <span className="text-[10px] text-gray-300 pl-2">↓ {convPct}% avançam</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Tabela detalhada */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Etapa</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Negócios</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Valor total</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">% do funil</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Conversão</th>
              </tr>
            </thead>
            <tbody>
              {FUNNEL.map((f, i) => {
                const next      = FUNNEL[i + 1]
                const convPct   = next ? Math.round((next.count / f.count) * 100) : '—'
                return (
                  <tr key={f.stage} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                        {f.stage}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{f.count}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmt(f.value)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{f.pct}%</td>
                    <td className="px-4 py-3 text-right">
                      {convPct === '—' ? (
                        <span className="text-gray-300">—</span>
                      ) : (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          (convPct as number) >= 50 ? 'bg-emerald-100 text-emerald-700' :
                          (convPct as number) >= 30 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-600'
                        }`}>{convPct}%</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estilo de impressão */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .flex-col * { visibility: visible; }
          .flex-col { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
