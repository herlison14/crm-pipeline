'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { section: 'Principal', items: [
    { href: '/',         icon: '⊞', label: 'Dashboard'  },
    { href: '/pipeline', icon: '⫿', label: 'Pipeline'   },
  ]},
  { section: 'Cadastros', items: [
    { href: '/contacts',   icon: '◎', label: 'Contatos',   badge: '124' },
    { href: '/activities', icon: '▷', label: 'Atividades',  badge: '7'  },
  ]},
  { section: 'Análise', items: [
    { href: '/reports',     icon: '↗', label: 'Relatórios'  },
    { href: '/automations', icon: '⟳', label: 'Automações'  },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-[12px] font-bold">C</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-gray-900 leading-none">CRM Pro</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Gestão de Vendas</p>
          </div>
        </div>
        <button
          className="md:hidden p-1 text-gray-400 hover:text-gray-600"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map((group) => (
          <div key={group.section}>
            <p className="px-2 py-2 mt-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              {group.section}
            </p>
            {group.items.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href)
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  badge={'badge' in item ? (item as any).badge : undefined}
                  active={active}
                  onClick={() => setOpen(false)}
                />
              )
            })}
          </div>
        ))}
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
    </>
  )

  return (
    <>
      {/* Botão hamburger — só mobile */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white rounded-lg shadow border border-gray-200"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <span className="text-[18px] leading-none text-gray-600">☰</span>
      </button>

      {/* Backdrop overlay — só mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar desktop: estática | mobile: drawer deslizante */}
      <aside
        className={`
          flex flex-col bg-white border-r border-gray-200
          w-[220px] min-w-[220px]
          fixed top-0 left-0 h-full z-50 transition-transform duration-200
          md:static md:translate-x-0 md:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {navContent}
      </aside>
    </>
  )
}

function NavItem({
  href,
  icon,
  label,
  badge,
  active,
  onClick,
}: {
  href:     string
  icon:     string
  label:    string
  badge?:   string
  active?:  boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
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
