import type { Metadata } from 'next'
import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { brand } from '@/config/brand'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DatenschutzPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEN = locale === 'en'

  return (
    <>
      <PublicNav locale={locale} />
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          {isEN ? 'Privacy Policy' : 'Datenschutzerklärung'}
        </h1>
        <p className="text-[var(--muted)] mb-10">{isEN ? 'Last updated: see below' : 'Zuletzt aktualisiert: siehe unten'}</p>

        <div className="prose-legal space-y-8 text-[var(--foreground)]">
          <Section title={isEN ? '1. Controller' : '1. Verantwortlicher (Art. 13 DSGVO)'}>
            <p>{brand.name} UG (haftungsbeschränkt), [Adresse], Deutschland. E-Mail: datenschutz@taxalex.de</p>
          </Section>

          <Section title={isEN ? '2. Data collected' : '2. Erhobene Daten'}>
            <p>Wir erheben folgende Daten:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Registrierungsdaten (E-Mail, Name)</li>
              <li>Hochgeladene Dokumente (nur zur Verarbeitung, keine dauerhafte Speicherung ohne Zustimmung)</li>
              <li>Nutzungsdaten (IP-Adresse, Browser-Typ, Seitenaufrufe)</li>
              <li>Zahlungsdaten (über Stripe, werden nicht direkt gespeichert)</li>
            </ul>
          </Section>

          <Section title={isEN ? '3. Purpose and legal basis' : '3. Zwecke und Rechtsgrundlagen'}>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)</li>
              <li>Berechtigte Interessen: Sicherheit, Missbrauchsprävention (Art. 6 Abs. 1 lit. f DSGVO)</li>
              <li>Einwilligung für Analytics (Art. 6 Abs. 1 lit. a DSGVO)</li>
            </ul>
          </Section>

          <Section title={isEN ? '4. Data retention' : '4. Speicherdauer'}>
            <p>Registrierungsdaten werden für die Dauer des Vertragsverhältnisses gespeichert. Hochgeladene Dokumente werden nach der Verarbeitung gelöscht, sofern keine ausdrückliche Zustimmung zur Speicherung vorliegt.</p>
          </Section>

          <Section title={isEN ? '5. Your rights' : '5. Ihre Rechte (Art. 15–21 DSGVO)'}>
            <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Wenden Sie sich an datenschutz@taxalex.de.</p>
          </Section>

          <Section title={isEN ? '6. Cookies' : '6. Cookies'}>
            <p>Wir verwenden essentielle Cookies (technisch notwendig) sowie optionale Analytics-Cookies (nur nach Ihrer Einwilligung). Nähere Informationen finden Sie in unserer Cookie-Richtlinie unter /cookies.</p>
          </Section>

          <Section title={isEN ? '7. Third-party services' : '7. Drittanbieter'}>
            <ul className="list-disc pl-5 space-y-1">
              <li>Hetzner GmbH (Hosting, EU-Server, Deutschland)</li>
              <li>Stripe (Zahlungsabwicklung, USA/EU)</li>
              <li>Google Analytics (nur nach Zustimmung)</li>
              <li>PostHog (nur nach Zustimmung)</li>
              <li>Anthropic, Google, Perplexity (KI-Verarbeitung, API-basiert)</li>
            </ul>
          </Section>

          <Section title={isEN ? '8. Right to complain' : '8. Beschwerderecht'}>
            <p>Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren. Zuständige Behörde: Landesbeauftragte für Datenschutz und Informationsfreiheit Ihres Bundeslandes.</p>
          </Section>
        </div>
      </div>
      <Footer locale={locale} />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">{title}</h2>
      <div className="text-sm text-[var(--muted)] leading-relaxed space-y-2">{children}</div>
    </section>
  )
}
