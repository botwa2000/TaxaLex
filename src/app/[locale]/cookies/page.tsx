import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'

export default async function CookiePolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEN = locale === 'en'

  return (
    <>
      <PublicNav locale={locale} />
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          {isEN ? 'Cookie Policy' : 'Cookie-Richtlinie'}
        </h1>
        <p className="text-[var(--muted)] mb-10">{isEN ? 'Effective date: see below' : 'Zuletzt aktualisiert: wird vor Launch finalisiert'}</p>

        <div className="prose-legal space-y-8">

          <section>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              {isEN ? 'What are cookies?' : 'Was sind Cookies?'}
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {isEN
                ? 'Cookies are small text files stored on your device by your browser. We use them to keep you logged in and to understand how you use our service (only after your consent).'
                : 'Cookies sind kleine Textdateien, die von Ihrem Browser auf Ihrem Gerät gespeichert werden. Wir verwenden sie, um Sie eingeloggt zu halten und zu verstehen, wie Sie unseren Service nutzen (nur nach Ihrer Einwilligung).'}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              {isEN ? 'Essential cookies (always active)' : 'Essentielle Cookies (immer aktiv)'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="py-2 pr-4 text-[var(--foreground)] font-semibold">Cookie</th>
                    <th className="py-2 pr-4 text-[var(--foreground)] font-semibold">{isEN ? 'Purpose' : 'Zweck'}</th>
                    <th className="py-2 text-[var(--foreground)] font-semibold">{isEN ? 'Duration' : 'Dauer'}</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--muted)]">
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-2 pr-4 font-mono text-xs">next-auth.session-token</td>
                    <td className="py-2 pr-4">{isEN ? 'Authentication session' : 'Authentifizierungs-Session'}</td>
                    <td className="py-2">30 {isEN ? 'days' : 'Tage'}</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-2 pr-4 font-mono text-xs">cookie-consent</td>
                    <td className="py-2 pr-4">{isEN ? 'Stores your consent choices' : 'Speichert Ihre Einwilligungen'}</td>
                    <td className="py-2">1 {isEN ? 'year' : 'Jahr'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">theme</td>
                    <td className="py-2 pr-4">{isEN ? 'Light/dark mode preference' : 'Hell/Dunkel-Modus'}</td>
                    <td className="py-2">{isEN ? 'Persistent' : 'Dauerhaft'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              {isEN ? 'Analytics cookies (optional)' : 'Analytics-Cookies (optional, nur nach Zustimmung)'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="py-2 pr-4 text-[var(--foreground)] font-semibold">Cookie</th>
                    <th className="py-2 pr-4 text-[var(--foreground)] font-semibold">{isEN ? 'Provider' : 'Anbieter'}</th>
                    <th className="py-2 text-[var(--foreground)] font-semibold">{isEN ? 'Purpose' : 'Zweck'}</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--muted)]">
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-2 pr-4 font-mono text-xs">_ga, _ga_*</td>
                    <td className="py-2 pr-4">Google Analytics</td>
                    <td className="py-2">{isEN ? 'Usage analytics' : 'Nutzungsstatistiken'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">ph_*</td>
                    <td className="py-2 pr-4">PostHog</td>
                    <td className="py-2">{isEN ? 'Product analytics' : 'Produkt-Analyse'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              {isEN ? 'Managing cookies' : 'Cookie-Einstellungen verwalten'}
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {isEN
                ? 'You can change your cookie preferences at any time using the cookie settings button in the footer. You can also disable cookies in your browser settings, though this may affect functionality.'
                : 'Sie können Ihre Cookie-Einstellungen jederzeit über den Cookie-Einstellungen-Button ändern. Sie können Cookies auch in Ihren Browser-Einstellungen deaktivieren, jedoch kann dies die Funktionalität beeinträchtigen.'}
            </p>
          </section>

        </div>
      </div>
      <Footer locale={locale} />
    </>
  )
}
