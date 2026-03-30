// Root page — middleware redirects / → /de before this ever renders.
// This is a safety fallback only.
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/de')
}
