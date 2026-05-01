alter table public.fin_assets enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fin_assets'
      and policyname = 'fin_assets_select_own'
  ) then
    execute '
      create policy fin_assets_select_own
      on public.fin_assets
      for select
      using (auth.uid() = user_id)
    ';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fin_assets'
      and policyname = 'fin_assets_insert_own'
  ) then
    execute '
      create policy fin_assets_insert_own
      on public.fin_assets
      for insert
      with check (auth.uid() = user_id)
    ';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fin_assets'
      and policyname = 'fin_assets_update_own'
  ) then
    execute '
      create policy fin_assets_update_own
      on public.fin_assets
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id)
    ';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fin_assets'
      and policyname = 'fin_assets_delete_own'
  ) then
    execute '
      create policy fin_assets_delete_own
      on public.fin_assets
      for delete
      using (auth.uid() = user_id)
    ';
  end if;
end $$;
