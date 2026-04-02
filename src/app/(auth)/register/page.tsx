import { redirect } from 'next/navigation'

// This route is handled by next-intl middleware which redirects /register → /de/register.
// This fallback ensures any direct hit also redirects correctly.
export default function RegisterFallback() {
  redirect('/de/register')
}
