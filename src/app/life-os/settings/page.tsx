import Image from 'next/image'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/logout-button'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name =
    user.user_metadata?.full_name || user.user_metadata?.name || user.email
  const avatar = user.user_metadata?.avatar_url

  return (
    <main className="bg-base-200 flex min-h-screen items-center justify-center p-4">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body items-center text-center">
          {avatar ? (
            <div className="avatar mb-4">
              <div className="w-24 rounded-full">
                <Image
                  src={avatar}
                  alt="User avatar"
                  width={100}
                  height={100}
                />
              </div>
            </div>
          ) : null}

          <h2 className="card-title text-xl">{name}</h2>
          <p className="text-sm opacity-70">{user.email}</p>

          <div className="mt-6 w-full">
            <LogoutButton />
          </div>
        </div>
      </div>
    </main>
  )
}
