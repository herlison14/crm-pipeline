-- supabase/functions.sql
-- Funções auxiliares para gerenciar posições dos cards no Kanban

-- ============================================================
-- shift_deal_positions
-- Abre espaço em uma stage a partir de uma posição
-- direction: 1 = empurra para baixo, -1 = compacta para cima
-- ============================================================
create or replace function public.shift_deal_positions(
  p_stage_id  uuid,
  p_from_pos  int,
  p_direction int default 1
)
returns void language plpgsql as $$
begin
  update public.deals
  set position = position + p_direction
  where stage_id = p_stage_id
    and position >= p_from_pos;
end;
$$;

-- ============================================================
-- compact_stage_positions
-- Reordena posições sequencialmente (0,1,2...) após remoção
-- ============================================================
create or replace function public.compact_stage_positions(
  p_stage_id uuid
)
returns void language plpgsql as $$
declare
  r record;
  idx int := 0;
begin
  for r in
    select id from public.deals
    where stage_id = p_stage_id
    order by position asc
  loop
    update public.deals set position = idx where id = r.id;
    idx := idx + 1;
  end loop;
end;
$$;

-- ============================================================
-- reorder_deals_in_stage
-- Reordena múltiplos deals de uma vez (usado no drag-and-drop)
-- Recebe array de {id, position}
-- ============================================================
create or replace function public.reorder_deals_in_stage(
  p_updates jsonb  -- [{"id": "uuid", "position": 0}, ...]
)
returns void language plpgsql as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(p_updates)
  loop
    update public.deals
    set position = (item->>'position')::int
    where id = (item->>'id')::uuid;
  end loop;
end;
$$;
