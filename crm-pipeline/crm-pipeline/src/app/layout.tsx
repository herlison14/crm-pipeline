// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Sidebar } from '@/components/Sidebar'
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
          <Sidebar />

          {/* Conteúdo principal */}
          <main className="flex-1 overflow-hidden flex flex-col pt-12 md:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

