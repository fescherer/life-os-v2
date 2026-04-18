import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const authError = requestUrl.searchParams.get('error')

  if (!code || authError) {
    return NextResponse.redirect(
      new URL('/login?error=access_denied', requestUrl.origin)
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL('/login?error=access_denied', requestUrl.origin)
    )
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(
      new URL('/login?error=access_denied', requestUrl.origin)
    )
  }

  return NextResponse.redirect(new URL('/life-os', requestUrl.origin))
}
