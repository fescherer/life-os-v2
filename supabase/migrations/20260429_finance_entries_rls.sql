alter table public.fin_entries enable row level security;
alter table public.fin_assets_entries enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fin_entries'
      and policyname = 'fin_entries_select_own'
  ) then
    execute '
      create policy fin_entries_select_own
      on public.fin_entries
      for select
      using (auth.uid() = user_id)
    ';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fin_entries'
      and policyname = 'fin_entries_insert_own'
  ) then
    execute '
      create policy fin_entries_insert_own
      on public.fin_entries
      for insert
      with check (auth.uid() = user_id)
    ';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fin_entries'
      and policyname = 'fin_entries_update_own'
  ) then
    execute '
      create policy fin_entries_update_own
      on public.fin_entries
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id)
    ';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fin_entries'
      and policyname = 'fin_entries_delete_own'
  ) then
    execute '
      create policy fin_entries_delete_own
      on public.fin_entries
      for delete
      using (auth.uid() = user_id)
    ';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fin_assets_entries'
      and policyname = 'fin_assets_entries_select_own'
  ) then
    execute '
      create policy fin_assets_entries_select_own
      on public.fin_assets_entries
      for select
      using (auth.uid() = user_id)
    ';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fin_assets_entries'
      and policyname = 'fin_assets_entries_insert_own'
  ) then
    execute '
      create policy fin_assets_entries_insert_own
      on public.fin_assets_entries
      for insert
      with check (auth.uid() = user_id)
    ';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fin_assets_entries'
      and policyname = 'fin_assets_entries_update_own'
  ) then
    execute '
      create policy fin_assets_entries_update_own
      on public.fin_assets_entries
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id)
    ';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fin_assets_entries'
      and policyname = 'fin_assets_entries_delete_own'
  ) then
    execute '
      create policy fin_assets_entries_delete_own
      on public.fin_assets_entries
      for delete
      using (auth.uid() = user_id)
    ';
  end if;
end $$;
