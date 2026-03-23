// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CRM Pro',
  description: 'Sistema CRM completo com pipeline de vendas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-100 h-screen overflow-hidden`}>
        <div className="flex h-full">
          {/* Sidebar */}
          <aside className="w-[220px] min-w-[220px] bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-[12px] font-bold">C</span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900 leading-none">CRM Pro</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Gestão de Vendas</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-3 space-y-0.5">
              <p className="px-2 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Principal
              </p>

              <NavItem href="/" icon="⊞" label="Dashboard" />
              <NavItem href="/pipeline" icon="⫿" label="Pipeline" active />

              <p className="px-2 py-2 mt-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Cadastros
              </p>

              <NavItem href="/contacts"   icon="◎" label="Contatos"    badge="124" />
              <NavItem href="/companies"  icon="▦" label="Empresas" />
              <NavItem href="/activities" icon="▷" label="Atividades"  badge="7" />

              <p className="px-2 py-2 mt-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Análise
              </p>

              <NavItem href="/reports"     icon="↗" label="Relatórios" />
              <NavItem href="/automations" icon="⟳" label="Automações" />
            </nav>

            {/* User */}
            <div className="px-3 py-3 border-t border-gray-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[11px] font-bold text-emerald-700">
                HL
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-gray-700 truncate">Herlison</p>
                <p className="text-[10px] text-gray-400">Administrador</p>
              </div>
            </div>
          </aside>

          {/* Conteúdo principal */}
          <main className="flex-1 overflow-hidden flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

// ── Componente NavItem ──────────────────────────────────
function NavItem({
  href,
  icon,
  label,
  badge,
  active,
}: {
  href:    string
  icon:    string
  label:   string
  badge?:  string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors
        ${active
          ? 'bg-emerald-50 text-emerald-700 font-medium'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
        }
      `}
    >
      <span className="text-[14px] w-4 text-center">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
          {badge}
        </span>
      )}
    </Link>
  )
}
