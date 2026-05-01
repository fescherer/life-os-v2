import { ModalStackDemo } from '@/components/modal-stack-demo'
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
    <main className="flex min-h-[70vh] justify-center px-4 py-10">
      <div className="flex w-full max-w-4xl flex-col gap-8">
        <div className="space-y-2">
          <h1 className="text-base-content text-3xl font-semibold">
            Good afternoon, {userName}
          </h1>
          <p className="text-base-content/70 text-sm">
            This page now includes a stacked modal example so you can validate
            nested overlays in the real app shell.
          </p>
        </div>

        <ModalStackDemo />
      </div>
    </main>
  )
}
