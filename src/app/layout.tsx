/**
 * Root layout — minimal shell required by Next.js.
 * All locale-specific content lives in app/[locale]/layout.tsx.
 * The [locale] layout provides <html> and <body> with the correct lang attribute.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // next-intl [locale] child layout provides the html/body shell
  return children as React.ReactElement
}
