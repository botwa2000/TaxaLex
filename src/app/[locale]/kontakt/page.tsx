import type { Metadata } from 'next'
import { Mail, Clock } from 'lucide-react'
import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { brand } from '@/config/brand'

export const metadata: Metadata = {
  title: 'Kontakt',
  robots: { index: true, follow: true },
}

export default async function KontaktPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEN = locale === 'en'

  return (
    <>
      <PublicNav locale={locale} />
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
          {isEN ? 'Contact' : 'Kontakt'}
        </h1>
        <p className="text-[var(--muted)] mb-10 text-base leading-relaxed">
          {isEN
            ? 'Questions, feedback, or issues with your appeal? We\'re here to help.'
            : 'Fragen, Feedback oder Probleme mit Ihrem Einspruch? Wir helfen gerne weiter.'}
        </p>

        <div className="space-y-6">
          {/* Email */}
          <div className="flex items-start gap-4 p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)] mb-0.5">
                {isEN ? 'Email support' : 'E-Mail-Support'}
              </p>
              <a
                href={`mailto:${brand.supportEmail}`}
                className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
              >
                {brand.supportEmail}
              </a>
              <p className="text-xs text-[var(--muted)] mt-1">
                {isEN ? 'We reply within 1 business day.' : 'Wir antworten innerhalb von 1 Werktag.'}
              </p>
            </div>
          </div>

          {/* Response time */}
          <div className="flex items-start gap-4 p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)] mb-0.5">
                {isEN ? 'Support hours' : 'Supportzeiten'}
              </p>
              <p className="text-sm text-[var(--muted)]">
                {isEN ? 'Monday – Friday, 9:00 – 18:00 (CET)' : 'Montag – Freitag, 9:00 – 18:00 Uhr'}
              </p>
            </div>
          </div>
        </div>

        {/* Legal note */}
        <p className="mt-10 text-xs text-[var(--muted)] leading-relaxed border-t border-[var(--border)] pt-6">
          {isEN
            ? `${brand.name} does not provide legal advice within the meaning of the Legal Services Act (RDG). For urgent legal matters, please consult a licensed attorney or tax advisor.`
            : `${brand.name} erbringt keine Rechtsberatung i.S.d. RDG. Bei dringenden rechtlichen Fragen wenden Sie sich bitte an einen zugelassenen Rechtsanwalt oder Steuerberater.`}
        </p>
      </div>
      <Footer locale={locale} />
    </>
  )
}
