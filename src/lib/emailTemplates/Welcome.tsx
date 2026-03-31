import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from '@react-email/components'
import { brand } from '@/config/brand'

interface Props {
  name?: string | null
  dashboardUrl: string
  locale?: string
}

export function Welcome({ name, dashboardUrl, locale = 'de' }: Props) {
  const isEN = locale === 'en'
  const firstName = name?.split(' ')[0]
  const greeting = firstName
    ? (isEN ? `Welcome, ${firstName}! 👋` : `Willkommen, ${firstName}! 👋`)
    : (isEN ? 'Welcome to TaxaLex! 👋' : 'Willkommen bei TaxaLex! 👋')

  const features = isEN
    ? [
        { icon: '🤖', title: 'AI pipeline with 5 agents', desc: 'Draft, legal check, adversarial review, fact-checking, and final polish — all in parallel.' },
        { icon: '📋', title: 'All German notice types', desc: 'Tax, Jobcenter, pension, health insurance, fines, rent — every official notice.' },
        { icon: '⚡', title: 'Ready in under 5 minutes', desc: 'Answer a few questions, let the AI work, download a professional letter.' },
        { icon: '🇩🇪', title: 'German submission, your language', desc: 'Documents are written in German. You can use the app in any language.' },
      ]
    : [
        { icon: '🤖', title: '5 KI-Agenten in Sekunden', desc: 'Entwurf, Rechtsprüfung, Gegendarstellung, Faktencheck und Finalisierung — alles parallel.' },
        { icon: '📋', title: 'Alle Bescheid-Typen', desc: 'Steuer, Jobcenter, Rente, KV, Bußgeld, Miete — jeder Behördenbescheid abgedeckt.' },
        { icon: '⚡', title: 'Fertig in unter 5 Minuten', desc: 'Fragen beantworten, KI arbeiten lassen, professionellen Brief herunterladen.' },
        { icon: '📥', title: 'Versandbereit als TXT oder DOCX', desc: 'Einfach ausdrucken oder per E-Mail senden — keine weitere Bearbeitung nötig.' },
      ]

  return (
    <Html lang={isEN ? 'en' : 'de'}>
      <Head />
      <Preview>
        {isEN
          ? `Your ${brand.name} account is ready — start your first appeal now`
          : `Dein ${brand.name}-Konto ist bereit — starte jetzt deinen ersten Einspruch`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header band */}
          <Section style={headerBand}>
            <Text style={logoText}>{brand.name}</Text>
            <Text style={taglineText}>
              {isEN ? brand.taglineEn : brand.tagline}
            </Text>
          </Section>

          <Section style={contentSection}>
            <Heading style={heading}>{greeting}</Heading>

            <Text style={text}>
              {isEN
                ? `Your account is active and ready to use. ${brand.name} helps you write professional objection letters against German official notices — powered by 5 AI agents working in parallel.`
                : `Dein Konto ist aktiv und einsatzbereit. ${brand.name} hilft dir, professionelle Einspruchsschreiben gegen deutsche Bescheide zu erstellen — mit 5 KI-Agenten, die parallel arbeiten.`}
            </Text>

            {/* Feature grid */}
            <Section style={featureGrid}>
              {features.map((f) => (
                <Section key={f.title} style={featureItem}>
                  <Text style={featureIcon}>{f.icon}</Text>
                  <Text style={featureTitle}>{f.title}</Text>
                  <Text style={featureDesc}>{f.desc}</Text>
                </Section>
              ))}
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={dashboardUrl}>
                {isEN ? '→ Start my first appeal' : '→ Ersten Einspruch starten'}
              </Button>
              <Text style={ctaHint}>
                {isEN ? 'Free for your first document' : 'Erster Einspruch kostenlos testen'}
              </Text>
            </Section>

            {/* Reassurance strip */}
            <Section style={trustStrip}>
              {(isEN
                ? ['🔒 GDPR compliant', '🇪🇺 EU servers', '⚖️ RDG-compliant']
                : ['🔒 DSGVO-konform', '🇪🇺 EU-Server', '⚖️ RDG-konform']
              ).map((item) => (
                <Text key={item} style={trustItem}>{item}</Text>
              ))}
            </Section>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            {isEN
              ? `Questions? Write to ${brand.supportEmail}`
              : `Fragen? Schreibe an ${brand.supportEmail}`}
          </Text>
          <Text style={footer}>
            © {new Date().getFullYear()} {brand.name} — Bad Homburg vor der Höhe, Deutschland
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#f1f5f9',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  borderRadius: '16px',
  maxWidth: '540px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
}
const headerBand: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
  padding: '28px 32px',
}
const logoText: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 4px',
}
const taglineText: React.CSSProperties = {
  fontSize: '13px',
  color: 'rgba(255,255,255,0.8)',
  margin: '0',
}
const contentSection: React.CSSProperties = {
  padding: '32px',
}
const heading: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 16px',
}
const text: React.CSSProperties = {
  fontSize: '15px',
  color: '#334155',
  lineHeight: '1.7',
  margin: '0 0 24px',
}
const featureGrid: React.CSSProperties = {
  margin: '0 0 28px',
}
const featureItem: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '10px',
  padding: '14px 16px',
  marginBottom: '10px',
  borderLeft: '3px solid #2563eb',
}
const featureIcon: React.CSSProperties = {
  fontSize: '20px',
  margin: '0 0 4px',
}
const featureTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0 0 3px',
}
const featureDesc: React.CSSProperties = {
  fontSize: '13px',
  color: '#64748b',
  lineHeight: '1.5',
  margin: '0',
}
const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '0 0 24px',
}
const ctaButton: React.CSSProperties = {
  backgroundColor: '#2563eb',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  padding: '14px 32px',
  textDecoration: 'none',
  display: 'inline-block',
}
const ctaHint: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '8px 0 0',
}
const trustStrip: React.CSSProperties = {
  display: 'flex',
  gap: '0',
  justifyContent: 'center',
  borderTop: '1px solid #f1f5f9',
  paddingTop: '16px',
}
const trustItem: React.CSSProperties = {
  fontSize: '12px',
  color: '#64748b',
  margin: '0 12px 0 0',
  display: 'inline',
}
const hr: React.CSSProperties = { borderColor: '#e2e8f0', margin: '0 32px 16px' }
const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  lineHeight: '1.5',
  margin: '0 32px 8px',
}
