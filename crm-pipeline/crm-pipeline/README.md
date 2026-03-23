# CRM Pro — Pipeline de Vendas

Sistema CRM com pipeline Kanban drag-and-drop, construído com **Next.js 14** + **Supabase**.

---

## 🗂️ Estrutura do Projeto

```
crm-pipeline/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Sidebar + layout raiz
│   │   ├── globals.css
│   │   └── pipeline/
│   │       └── page.tsx        ← Página do Pipeline
│   ├── components/
│   │   └── kanban/
│   │       ├── KanbanBoard.tsx  ← Componente principal (DnD context)
│   │       ├── KanbanColumn.tsx ← Coluna droppable + lista sortable
│   │       ├── DealCard.tsx     ← Card draggable do negócio
│   │       └── DealModal.tsx    ← Modal de criar/editar negócio
│   ├── hooks/
│   │   └── usePipeline.ts      ← Hook com dados + optimistic updates
│   ├── lib/
│   │   └── supabase.ts         ← Client Supabase + funções de dados
│   └── types/
│       └── crm.ts              ← Tipos TypeScript centrais
└── supabase/
    ├── migrations.sql          ← Schema completo + seed de dados
    └── functions.sql           ← Funções SQL para posicionamento
```

---

## 🚀 Setup — Passo a Passo

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/herlison14/crm-pipeline
cd crm-pipeline
npm install
```

### 2. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Aguarde o banco inicializar (~2 min)

### 3. Rodar as migrations

No **SQL Editor** do Supabase, execute em ordem:

```sql
-- 1. Schema principal (tabelas, índices, RLS, seed)
-- Cole o conteúdo de: supabase/migrations.sql

-- 2. Funções auxiliares (posicionamento dos cards)
-- Cole o conteúdo de: supabase/functions.sql
```

### 4. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com os valores do seu projeto Supabase:
- **Settings → API → Project URL**
- **Settings → API → anon/public key**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
# Acesse: http://localhost:3000/pipeline
```

---

## ✨ Funcionalidades do Pipeline

| Feature | Status |
|---|---|
| Visualização Kanban em colunas | ✅ |
| Drag-and-drop entre etapas | ✅ |
| Reordenação dentro da mesma coluna | ✅ |
| Criar negócio por qualquer etapa | ✅ |
| Editar negócio (modal) | ✅ |
| Excluir negócio | ✅ |
| Total de valor por coluna | ✅ |
| Tags nos cards | ✅ |
| Probabilidade de fechamento | ✅ |
| Responsável com avatar colorido | ✅ |
| Optimistic updates (sem delay visual) | ✅ |
| Histórico de movimentações (DB) | ✅ |

---

## 🗄️ Modelo de Dados

```
pipelines
  └── stages (etapas ordenadas por position)
        └── deals (negócios, ordenados por position)
              ├── contacts (join)
              └── deal_history (log de movimentações)
```

---

## 📦 Dependências Principais

| Pacote | Uso |
|---|---|
| `@supabase/supabase-js` | Client do banco de dados |
| `@dnd-kit/core` | Engine de drag-and-drop |
| `@dnd-kit/sortable` | Listas sortáveis dentro das colunas |
| `tailwindcss` | Estilização utilitária |

---

## 🔜 Próximos Módulos

Após o pipeline, a ordem sugerida é:

1. **Contatos** — CRUD com busca, tags e score de engajamento
2. **Atividades** — Agenda com calendário (FullCalendar)
3. **Dashboard** — KPIs + gráficos (Recharts)
4. **Relatórios** — Funil de conversão + exportação PDF
5. **Automações** — Gatilhos por evento → ações automáticas

---

## 🔐 Autenticação (próximo passo)

O schema já tem RLS habilitado. Para ativar autenticação real:

1. Habilite **Email Auth** em Authentication → Providers
2. Substitua as policies "allow_all" por policies baseadas em `auth.uid()`
3. Adicione `user_id` nas tabelas `pipelines` e `deals`
4. Use `@supabase/auth-helpers-nextjs` para proteger as rotas

---

*Gerado com CRM Pro Starter · herlison14/crm-pipeline*
