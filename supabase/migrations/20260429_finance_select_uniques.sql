-- Remove duplicate select rows, keeping the smallest id for each (user_id, name).
delete from public.selects duplicate_select
using public.selects canonical_select
where duplicate_select.user_id = canonical_select.user_id
  and duplicate_select.name = canonical_select.name
  and duplicate_select.id > canonical_select.id;

-- Remove duplicate options, keeping the smallest id for each (user_id, select_id, value).
delete from public.selects_options duplicate_option
using public.selects_options canonical_option
where duplicate_option.user_id = canonical_option.user_id
  and duplicate_option.select_id = canonical_option.select_id
  and duplicate_option.value = canonical_option.value
  and duplicate_option.id > canonical_option.id;

create unique index if not exists selects_user_id_name_unique
  on public.selects (user_id, name);

create unique index if not exists selects_options_user_id_select_id_value_unique
  on public.selects_options (user_id, select_id, value);
