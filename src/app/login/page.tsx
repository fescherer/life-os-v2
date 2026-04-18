import { Suspense } from 'react'
import LoginContent from './login-content'

export default function LoginPage() {
  return (
    // `useSearchParams()` in the client component needs a Suspense boundary.
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
