import { redirect } from 'next/navigation'

// This route is handled by next-intl middleware which redirects /login → /de/login.
// This fallback ensures any direct hit also redirects correctly.
export default function LoginFallback() {
  redirect('/de/login')
}
