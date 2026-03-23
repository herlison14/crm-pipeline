-- ============================================================
-- CRM Pro — Supabase Schema
-- Pipeline de Vendas
-- ============================================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELA: pipelines
-- ============================================================
create table public.pipelines (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  is_default  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- TABELA: stages (etapas do funil)
-- ============================================================
create table public.stages (
  id          uuid primary key default uuid_generate_v4(),
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  name        text not null,
  position    int  not null default 0,       -- ordem de exibição (0, 1, 2...)
  color       text default '#6b7280',        -- cor hex do cabeçalho
  probability int  default 0 check (probability between 0 and 100),
  created_at  timestamptz default now()
);

create index idx_stages_pipeline on public.stages(pipeline_id);
create index idx_stages_position  on public.stages(pipeline_id, position);

-- ============================================================
-- TABELA: contacts
-- ============================================================
create table public.contacts (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text,
  phone      text,
  company    text,
  avatar_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: deals (negócios)
-- ============================================================
create table public.deals (
  id                  uuid primary key default uuid_generate_v4(),
  pipeline_id         uuid not null references public.pipelines(id) on delete cascade,
  stage_id            uuid not null references public.stages(id) on delete restrict,
  contact_id          uuid references public.contacts(id) on delete set null,
  title               text not null,
  value               numeric(15,2) default 0,
  currency            char(3) default 'BRL',
  probability         int default 0 check (probability between 0 and 100),
  expected_close_date date,
  owner_name          text,
  owner_initials      char(2),
  owner_color         text default '#3b82f6',
  tags                text[] default '{}',
  lost_reason         text,
  status              text default 'open' check (status in ('open','won','lost')),
  position            int  not null default 0,  -- ordem dentro da coluna
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index idx_deals_pipeline on public.deals(pipeline_id);
create index idx_deals_stage    on public.deals(stage_id);
create index idx_deals_status   on public.deals(status);
create index idx_deals_position on public.deals(stage_id, position);

-- ============================================================
-- TABELA: deal_history (log de movimentações)
-- ============================================================
create table public.deal_history (
  id            uuid primary key default uuid_generate_v4(),
  deal_id       uuid not null references public.deals(id) on delete cascade,
  from_stage_id uuid references public.stages(id) on delete set null,
  to_stage_id   uuid references public.stages(id) on delete set null,
  moved_by      text,
  note          text,
  created_at    timestamptz default now()
);

create index idx_deal_history_deal on public.deal_history(deal_id);

-- ============================================================
-- TRIGGER: atualiza updated_at automaticamente
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger deals_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

create trigger pipelines_updated_at
  before update on public.pipelines
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (habilitar — configurar policies por auth)
-- ============================================================
alter table public.pipelines    enable row level security;
alter table public.stages       enable row level security;
alter table public.deals        enable row level security;
alter table public.contacts     enable row level security;
alter table public.deal_history enable row level security;

-- Policies permissivas temporárias (ajustar com auth real)
create policy "allow_all_pipelines"    on public.pipelines    for all using (true) with check (true);
create policy "allow_all_stages"       on public.stages       for all using (true) with check (true);
create policy "allow_all_deals"        on public.deals        for all using (true) with check (true);
create policy "allow_all_contacts"     on public.contacts     for all using (true) with check (true);
create policy "allow_all_deal_history" on public.deal_history for all using (true) with check (true);

-- ============================================================
-- SEED: dados de exemplo
-- ============================================================
do $$
declare
  p_id  uuid;
  s1 uuid; s2 uuid; s3 uuid; s4 uuid; s5 uuid;
  c1 uuid; c2 uuid; c3 uuid;
begin
  -- Pipeline principal
  insert into public.pipelines (name, description, is_default)
  values ('Vendas Principal', 'Funil padrão de vendas', true)
  returning id into p_id;

  -- Etapas
  insert into public.stages (pipeline_id, name, position, color, probability) values (p_id, 'Prospecção',  0, '#6b7280', 10) returning id into s1;
  insert into public.stages (pipeline_id, name, position, color, probability) values (p_id, 'Qualificação',1, '#3b82f6', 30) returning id into s2;
  insert into public.stages (pipeline_id, name, position, color, probability) values (p_id, 'Proposta',    2, '#f59e0b', 55) returning id into s3;
  insert into public.stages (pipeline_id, name, position, color, probability) values (p_id, 'Negociação',  3, '#8b5cf6', 75) returning id into s4;
  insert into public.stages (pipeline_id, name, position, color, probability) values (p_id, 'Fechamento',  4, '#16a34a', 90) returning id into s5;

  -- Contatos
  insert into public.contacts (name, email, company) values ('Thiago Ferreira', 'thiago@techcorp.com', 'TechCorp Brasil') returning id into c1;
  insert into public.contacts (name, email, company) values ('Marina Cardoso',  'marina@nexus.com',    'Grupo Nexus')     returning id into c2;
  insert into public.contacts (name, email, company) values ('Ricardo Silva',   'ricardo@visao.com',   'Visão Digital')   returning id into c3;

  -- Deals — Prospecção
  insert into public.deals (pipeline_id, stage_id, contact_id, title, value, probability, owner_name, owner_initials, owner_color, tags, position)
  values (p_id, s1, c1, 'StartupHub · Licença SaaS', 18000, 20, 'Juliana S.', 'JS', '#8b5cf6', '{}', 0);
  insert into public.deals (pipeline_id, stage_id, contact_id, title, value, probability, owner_name, owner_initials, owner_color, tags, position)
  values (p_id, s1, c2, 'Distribuidora Alfa · ERP', 24000, 15, 'Carlos M.', 'CM', '#f59e0b', '{}', 1);

  -- Deals — Qualificação
  insert into public.deals (pipeline_id, stage_id, contact_id, title, value, probability, owner_name, owner_initials, owner_color, tags, position)
  values (p_id, s2, c1, 'TechCorp · Consultoria', 36000, 45, 'Herlison', 'HL', '#16a34a', array['Prioritário','Enterprise'], 0);
  insert into public.deals (pipeline_id, stage_id, contact_id, title, value, probability, owner_name, owner_initials, owner_color, tags, position)
  values (p_id, s2, c2, 'Varejo Plus · Automação', 31000, 40, 'Carlos M.', 'CM', '#f59e0b', '{}', 1);

  -- Deals — Proposta
  insert into public.deals (pipeline_id, stage_id, contact_id, title, value, probability, owner_name, owner_initials, owner_color, tags, position)
  values (p_id, s3, c2, 'Grupo Nexus · Integração', 52000, 70, 'Ana Paula', 'AP', '#8b5cf6', array['Urgente'], 0);
  insert into public.deals (pipeline_id, stage_id, contact_id, title, value, probability, owner_name, owner_initials, owner_color, tags, position)
  values (p_id, s3, c3, 'Visão Digital · CRM', 32000, 65, 'Herlison', 'HL', '#16a34a', '{}', 1);

  -- Deals — Negociação
  insert into public.deals (pipeline_id, stage_id, contact_id, title, value, probability, owner_name, owner_initials, owner_color, tags, position)
  values (p_id, s4, c1, 'Industrias RNB · ERP', 38000, 80, 'Carlos M.', 'CM', '#f59e0b', '{}', 0);

  -- Deals — Fechamento
  insert into public.deals (pipeline_id, stage_id, contact_id, title, value, probability, owner_name, owner_initials, owner_color, tags, position, status)
  values (p_id, s5, c2, 'MegaStore · Plataforma', 68000, 100, 'Herlison', 'HL', '#16a34a', '{}', 0, 'won');
  insert into public.deals (pipeline_id, stage_id, contact_id, title, value, probability, owner_name, owner_initials, owner_color, tags, position, status)
  values (p_id, s5, c3, 'FinTech Rio · API', 40000, 100, 'Ana Paula', 'AP', '#8b5cf6', '{}', 1, 'won');
end;
$$;
