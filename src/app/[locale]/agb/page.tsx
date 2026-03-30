import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'

export default async function AGBPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEN = locale === 'en'

  return (
    <>
      <PublicNav locale={locale} />
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
          <strong>Hinweis:</strong> Diese AGB sind ein Entwurf und werden vor Launch von einem Rechtsanwalt überprüft.
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          {isEN ? 'Terms of Service' : 'Allgemeine Geschäftsbedingungen (AGB)'}
        </h1>
        <p className="text-[var(--muted)] mb-10">{isEN ? 'Last updated: pending legal review' : 'Stand: rechtliche Prüfung ausstehend'}</p>

        <div className="prose-legal space-y-8 text-[var(--foreground)]">
          <Section title="§ 1 Geltungsbereich">
            <p>Diese Allgemeinen Geschäftsbedingungen gelten für alle Leistungen der TaxaLex UG (haftungsbeschränkt) (nachfolgend „Anbieter") gegenüber Nutzern der Plattform taxalex.de (nachfolgend „Nutzer").</p>
          </Section>
          <Section title="§ 2 Leistungsgegenstand">
            <p>TaxaLex stellt eine KI-gestützte Software zur Verfügung, die Nutzer bei der Erstellung von Einspruchs- und Widerspruchsschreiben gegen behördliche Bescheide unterstützt. Die generierten Schreiben stellen keine Rechtsberatung i.S.d. Rechtsdienstleistungsgesetzes (RDG) dar.</p>
          </Section>
          <Section title="§ 3 Vertragsschluss">
            <p>Der Vertrag kommt durch Registrierung auf der Plattform und Annahme dieser AGB zustande.</p>
          </Section>
          <Section title="§ 4 Preise und Zahlung">
            <p>Die aktuellen Preise sind auf der Preisseite unter /preise einsehbar. Die Zahlung erfolgt über Stripe. Alle Preise sind Endpreise inkl. MwSt.</p>
          </Section>
          <Section title="§ 5 Widerrufsrecht">
            <p>Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Nach vollständiger Erbringung der Leistung (Generierung des Einspruchsschreibens) erlischt das Widerrufsrecht bei digitalen Inhalten gemäß § 356 Abs. 5 BGB.</p>
          </Section>
          <Section title="§ 6 Haftungsausschluss">
            <p>Der Anbieter haftet nicht für die rechtliche Wirksamkeit der generierten Schreiben. Die Nutzung erfolgt auf eigene Verantwortung. Bei rechtlichen Unsicherheiten empfiehlt der Anbieter die Hinzuziehung eines zugelassenen Rechtsanwalts oder Steuerberaters.</p>
          </Section>
          <Section title="§ 7 Datenschutz">
            <p>Es gilt die Datenschutzerklärung unter /datenschutz. Personenbezogene Daten werden gemäß DSGVO verarbeitet.</p>
          </Section>
          <Section title="§ 8 Gerichtsstand">
            <p>Ausschließlicher Gerichtsstand für Streitigkeiten mit Kaufleuten ist der Sitz des Anbieters.</p>
          </Section>
          <Section title="§ 9 Anwendbares Recht">
            <p>Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts (CISG).</p>
          </Section>
          <Section title="§ 10 Schlussbestimmungen">
            <p>Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
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
