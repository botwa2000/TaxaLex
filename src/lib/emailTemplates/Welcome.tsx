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
  const greeting = firstName ? (isEN ? `Welcome, ${firstName}!` : `Willkommen, ${firstName}!`) : (isEN ? 'Welcome!' : 'Willkommen!')

  return (
    <Html lang={isEN ? 'en' : 'de'}>
      <Head />
      <Preview>
        {isEN ? `Welcome to ${brand.name} — your first appeal is waiting` : `Willkommen bei ${brand.name} — dein erster Einspruch wartet`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>{brand.name}</Text>
          </Section>

          <Heading style={heading}>{greeting}</Heading>

          <Text style={text}>
            {isEN
              ? `Your account is ready. ${brand.name} helps you draft professional objection letters against German official notices — in under 5 minutes, with 5 AI agents working in parallel.`
              : `Dein Konto ist bereit. ${brand.name} hilft dir, professionelle Einspruchsschreiben gegen Bescheide zu erstellen — in unter 5 Minuten, mit 5 KI-Agenten parallel.`}
          </Text>

          <Section style={bulletSection}>
            {(isEN ? [
              '11-step AI pipeline: draft, cross-check, adversarial review',
              'All notice types: tax, jobcenter, rent, pension, fines, and more',
              'Download as TXT or DOCX — ready to send',
            ] : [
              '11-Schritt-KI-Pipeline: Entwurf, Prüfung, Gegendarstellung',
              'Alle Bescheid-Typen: Steuer, Jobcenter, Miete, Rente, Bußgeld u.v.m.',
              'Download als TXT oder DOCX — versandbereit',
            ]).map((item) => (
              <Text key={item} style={bullet}>✓ {item}</Text>
            ))}
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href={dashboardUrl}>
              {isEN ? 'Go to my dashboard' : 'Zum Dashboard'}
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            {isEN
              ? `Questions? Reply to this email or visit ${brand.supportEmail}`
              : `Fragen? Antworte auf diese E-Mail oder schreibe an ${brand.supportEmail}`}
          </Text>
          <Text style={footer}>
            © {new Date().getFullYear()} {brand.name} — Bad Homburg vor der Höhe, Deutschland
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '32px',
  borderRadius: '12px',
  maxWidth: '520px',
  border: '1px solid #e2e8f0',
}
const logoSection: React.CSSProperties = { marginBottom: '24px' }
const logoText: React.CSSProperties = {
  fontSize: '20px', fontWeight: '700', color: '#2563eb', margin: '0',
}
const heading: React.CSSProperties = {
  fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px',
}
const text: React.CSSProperties = {
  fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 16px',
}
const bulletSection: React.CSSProperties = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '4px 16px',
  margin: '0 0 24px',
}
const bullet: React.CSSProperties = {
  fontSize: '14px', color: '#1e40af', lineHeight: '1.5', margin: '8px 0',
}
const buttonSection: React.CSSProperties = { margin: '28px 0' }
const button: React.CSSProperties = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr: React.CSSProperties = { borderColor: '#e2e8f0', margin: '24px 0' }
const footer: React.CSSProperties = {
  fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 8px',
}
