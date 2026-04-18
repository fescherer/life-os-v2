import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function LifeOsHomePage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Keep the page safe even if the proxy is bypassed during local rendering.
  if (error || !user) {
    redirect('/login')
  }

  const userName =
    user.user_metadata.full_name ??
    user.user_metadata.name ??
    user.email ??
    'there'

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <h1 className="text-base-content text-3xl font-semibold">
        Good afternoon, {userName}
      </h1>
    </main>
  )
}
