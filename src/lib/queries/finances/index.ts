import { Tables } from "@/types/supabase"
import { getSupabaseConfig, TInsertRow, TUpdateRow } from ".."

export type TTableFinances = Tables<'fin_entries'>
export async function getFinances(): Promise<TTableFinances[]>  {
  const { user, supabase } = await getSupabaseConfig()

  const { data, error } = await supabase
    .from("fin_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  if (error) throw error

  return data ?? []
}

export async function insertFinanceEntry(entry: TInsertRow<'fin_entries'>): Promise<TTableFinances> {
  const { user, supabase } = await getSupabaseConfig()

  const { data, error } = await supabase
    .from("fin_entries")
    .insert({ ...entry, user_id: user.id })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateFinanceEntry(id: string, entry: TUpdateRow<"fin_entries">) : Promise<TTableFinances> {
  const { user, supabase } = await getSupabaseConfig()
  const updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from("fin_entries")
    .update({...entry, updated_at})
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error("Update failed")
  
  return data
}

export type TTableAssets = Tables<'fin_assets'>
export async function getAssets(): Promise<TTableAssets[]> {
  const { user, supabase } = await getSupabaseConfig()

  const { data, error } = await supabase
    .from("fin_assets")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  if (error) throw error

  return data
}


export async function getFinancePageData() {
  const { user, supabase } = await getSupabaseConfig()

  const [entriesResult, assetsResult] = await Promise.all([
    supabase
      .from("fin_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),

    supabase
      .from("fin_assets")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),
  ])

  if (entriesResult.error) throw entriesResult.error
  if (assetsResult.error) throw assetsResult.error

  return {
    entries: entriesResult.data,
    assets: assetsResult.data,
  }
}



