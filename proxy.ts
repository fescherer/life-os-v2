import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const publicRoutes = new Set(['/login', '/auth/callback'])
const publicFilePattern = /\.[^/]+$/

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let public entry points, Next internals, and real static files pass through.
  if (
    publicRoutes.has(pathname) ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    publicFilePattern.test(pathname)
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // If there is no authenticated user in the Supabase session, send them to login.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
