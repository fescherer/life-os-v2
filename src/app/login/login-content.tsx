'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const accessDeniedMessage =
  'This account is not enabled to use this application. If you believe this is a mistake, please contact support.'

export default function LoginContent() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const searchParams = useSearchParams()
  const supabase = createClient()

  const showAccessDenied = searchParams.get('error') === 'access_denied'

  const handleSignIn = async () => {
    setIsSubmitting(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="border-base-300 bg-base-100 w-full max-w-md rounded-2xl border p-8 text-center shadow-sm">
        <h1 className="text-base-content text-2xl font-semibold">Login</h1>
        <p className="text-base-content/70 mt-3 text-sm">
          Sign in to continue to Life OS.
        </p>

        {showAccessDenied ? (
          <p className="text-base-content/65 mt-4 text-sm">
            {accessDeniedMessage}
          </p>
        ) : null}

        <button
          className="btn btn-neutral mt-6 w-full"
          disabled={isSubmitting}
          onClick={handleSignIn}
          type="button"
        >
          {isSubmitting ? 'Redirecting...' : 'Sign in with Google'}
        </button>
      </div>
    </main>
  )
}
