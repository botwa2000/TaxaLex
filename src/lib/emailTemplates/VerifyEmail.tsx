import {
  Body, Container, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from '@react-email/components'
import { brand } from '@/config/brand'

interface Props {
  name?: string | null
  code: string
  locale?: string
}

export function VerifyEmail({ name, code, locale = 'de' }: Props) {
  const isEN = locale === 'en'
  const greeting = name
    ? (isEN ? `Hi ${name},` : `Hallo ${name},`)
    : (isEN ? 'Hi,' : 'Hallo,')

  // Format code as "123 456" for readability
  const codeFormatted = `${code.slice(0, 3)} ${code.slice(3)}`

  return (
    <Html lang={isEN ? 'en' : 'de'}>
      <Head />
      <Preview>
        {isEN
          ? `Your ${brand.name} verification code: ${codeFormatted}`
          : `Dein ${brand.name} Bestätigungscode: ${codeFormatted}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>{brand.name}</Text>
          </Section>

          <Heading style={heading}>
            {isEN ? 'Confirm your email address' : 'E-Mail-Adresse bestätigen'}
          </Heading>

          <Text style={text}>{greeting}</Text>
          <Text style={text}>
            {isEN
              ? 'Enter this code to verify your email address. It expires in 15 minutes.'
              : 'Gib diesen Code ein, um deine E-Mail-Adresse zu bestätigen. Er ist 15 Minuten gültig.'}
          </Text>

          {/* Big code display */}
          <Section style={codeSection}>
            <Text style={codeText}>{codeFormatted}</Text>
          </Section>

          <Text style={smallText}>
            {isEN
              ? 'If you did not create a TaxaLex account, you can safely ignore this email.'
              : 'Falls du kein Konto bei TaxaLex erstellt hast, kannst du diese E-Mail ignorieren.'}
          </Text>

          <Hr style={hr} />

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
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '32px',
  borderRadius: '12px',
  maxWidth: '480px',
  border: '1px solid #e2e8f0',
}
const logoSection: React.CSSProperties = { marginBottom: '24px' }
const logoText: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#2563eb',
  margin: '0',
}
const heading: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 16px',
}
const text: React.CSSProperties = {
  fontSize: '15px',
  color: '#334155',
  lineHeight: '1.6',
  margin: '0 0 12px',
}
const codeSection: React.CSSProperties = {
  backgroundColor: '#f0f4ff',
  borderRadius: '12px',
  padding: '24px 0',
  margin: '24px 0',
  textAlign: 'center',
  border: '1px solid #c7d7fc',
}
const codeText: React.CSSProperties = {
  fontSize: '42px',
  fontWeight: '700',
  color: '#2563eb',
  letterSpacing: '8px',
  margin: '0',
  fontVariantNumeric: 'tabular-nums',
}
const smallText: React.CSSProperties = {
  fontSize: '13px',
  color: '#64748b',
  lineHeight: '1.5',
  margin: '0 0 24px',
}
const hr: React.CSSProperties = { borderColor: '#e2e8f0', margin: '24px 0' }
const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  lineHeight: '1.5',
  margin: '0',
}
