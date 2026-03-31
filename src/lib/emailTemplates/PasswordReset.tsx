import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from '@react-email/components'
import { brand } from '@/config/brand'

interface Props {
  name?: string | null
  resetUrl: string
  locale?: string
}

export function PasswordReset({ name, resetUrl, locale = 'de' }: Props) {
  const isEN = locale === 'en'
  const greeting = name ? (isEN ? `Hi ${name},` : `Hallo ${name},`) : (isEN ? 'Hi,' : 'Hallo,')

  return (
    <Html lang={isEN ? 'en' : 'de'}>
      <Head />
      <Preview>
        {isEN ? 'Reset your TaxaLex password' : 'Passwort für TaxaLex zurücksetzen'}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>{brand.name}</Text>
          </Section>

          <Heading style={heading}>
            {isEN ? 'Reset your password' : 'Passwort zurücksetzen'}
          </Heading>

          <Text style={text}>{greeting}</Text>
          <Text style={text}>
            {isEN
              ? 'We received a request to reset your password. Click the button below to choose a new password.'
              : 'Wir haben eine Anfrage zum Zurücksetzen deines Passworts erhalten. Klicke auf den Button, um ein neues Passwort zu wählen.'}
          </Text>

          <Section style={buttonSection}>
            <Button style={button} href={resetUrl}>
              {isEN ? 'Reset password' : 'Passwort zurücksetzen'}
            </Button>
          </Section>

          <Text style={warningText}>
            {isEN
              ? 'This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email — your password will not change.'
              : 'Dieser Link ist 1 Stunde gültig. Falls du kein Passwort-Reset angefordert hast, ignoriere diese E-Mail — dein Passwort bleibt unverändert.'}
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            {isEN
              ? `Or copy this URL into your browser: ${resetUrl}`
              : `Oder kopiere diesen Link in deinen Browser: ${resetUrl}`}
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
  fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px',
}
const text: React.CSSProperties = {
  fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 12px',
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
const warningText: React.CSSProperties = {
  fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 24px',
}
const hr: React.CSSProperties = { borderColor: '#e2e8f0', margin: '24px 0' }
const footer: React.CSSProperties = {
  fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 8px', wordBreak: 'break-all',
}
