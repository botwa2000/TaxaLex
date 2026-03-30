import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { brand } from '@/config/brand'

export default async function ImpressumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEN = locale === 'en'

  return (
    <>
      <PublicNav locale={locale} />
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">Impressum</h1>

        <div className="prose-legal space-y-8 text-[var(--foreground)]">
          <section>
            <h2 className="text-lg font-semibold mb-3">{isEN ? 'Service provider (§ 5 TMG)' : 'Angaben gemäß § 5 TMG'}</h2>
            <div className="text-sm text-[var(--muted)] space-y-1">
              <p className="font-medium text-[var(--foreground)]">{brand.name} UG (haftungsbeschränkt)</p>
              <p>[Straße und Hausnummer]</p>
              <p>[PLZ] [Stadt]</p>
              <p>Deutschland</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{isEN ? 'Contact' : 'Kontakt'}</h2>
            <div className="text-sm text-[var(--muted)] space-y-1">
              <p>E-Mail: kontakt@taxalex.de</p>
              <p>Web: https://taxalex.de</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{isEN ? 'Commercial register' : 'Handelsregister'}</h2>
            <div className="text-sm text-[var(--muted)] space-y-1">
              <p>Registergericht: Amtsgericht [Stadt]</p>
              <p>Registernummer: HRB [Nummer]</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">USt-IdNr.</h2>
            <p className="text-sm text-[var(--muted)]">DE[Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG]</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{isEN ? 'Responsible for content' : 'Verantwortlich für den Inhalt (§ 55 Abs. 2 RStV)'}</h2>
            <p className="text-sm text-[var(--muted)]">[Name Redaktionsverantwortlicher], [Adresse wie oben]</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">EU-Streitschlichtung</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline ml-1">
                https://ec.europa.eu/consumers/odr/
              </a>
              . Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
      </div>
      <Footer locale={locale} />
    </>
  )
}
