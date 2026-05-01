import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/supabase"


export async function getSupabase() {
  return await createClient()
}

export async function getSupabaseConfig() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  return { user, supabase }
}

type DbTables = Database["public"]["Tables"]
export type TableName = keyof DbTables
export type Row<T extends TableName> = DbTables[T]["Row"]
export type Insert<T extends TableName> = DbTables[T]["Insert"]
export type Update<T extends TableName> = DbTables[T]["Update"]

export type TUpdateRow<T extends TableName> = Omit<
  Update<T>,
  "id" | "user_id" | "created_at" | "updated_at"
>

export type TInsertRow<T extends TableName> = Omit<
  Insert<T>,
  "id" | "user_id" | "created_at" | "updated_at"
>
