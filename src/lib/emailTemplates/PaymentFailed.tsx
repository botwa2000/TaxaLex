import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from '@react-email/components'
import { brand } from '@/config/brand'
import { config } from '@/config/env'

interface Props {
  userName?: string | null
  planName: string
  retryUrl?: string
}

export function PaymentFailed({ userName, planName, retryUrl }: Props) {
  const greeting = userName ? `Hallo ${userName},` : 'Hallo,'
  const billingUrl = retryUrl ?? `${config.appUrl}/de/billing`

  return (
    <Html lang="de">
      <Head />
      <Preview>Zahlung fehlgeschlagen – Bitte Zahlungsmethode aktualisieren</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>{brand.name}</Text>
          </Section>

          <Heading style={heading}>Zahlung fehlgeschlagen</Heading>

          <Text style={text}>{greeting}</Text>
          <Text style={text}>
            Leider konnte Ihre Zahlung für das Abonnement <strong>{planName}</strong> nicht
            verarbeitet werden. Bitte überprüfen Sie Ihre Zahlungsmethode, damit Ihr Zugang
            nicht unterbrochen wird.
          </Text>

          <Section style={alertCard}>
            <Text style={alertText}>
              Wird die Zahlung nicht zeitnah beglichen, wird Ihr Abonnement pausiert und
              Sie verlieren den Zugang zu Ihren unbegrenzten Einsprüchen.
            </Text>
          </Section>

          <Text style={text}>
            Aktualisieren Sie jetzt Ihre Zahlungsdaten, um eine Unterbrechung zu vermeiden.
            Sobald die Zahlung erfolgreich verarbeitet wurde, bleibt Ihr Abonnement
            ohne Unterbrechung aktiv.
          </Text>

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={billingUrl} style={button}>
              Zahlungsmethode aktualisieren
            </Button>
          </Section>

          <Text style={smallText}>
            Falls Sie Fragen haben, wenden Sie sich bitte an unseren Support:{' '}
            <a href={`mailto:${brand.supportEmail}`} style={link}>{brand.supportEmail}</a>
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            {brand.name} GmbH — Bad Homburg vor der Höhe |{' '}
            Diese E-Mail ist kein steuerlicher Beleg i.S.d. UStG.
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
const logoText: React.CSSProperties = { fontSize: '20px', fontWeight: '700', color: '#2563eb', margin: '0' }
const heading: React.CSSProperties = { fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px' }
const text: React.CSSProperties = { fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 12px' }
const alertCard: React.CSSProperties = {
  backgroundColor: '#fff7ed', borderRadius: '8px', padding: '16px 20px',
  margin: '20px 0', border: '1px solid #fed7aa',
}
const alertText: React.CSSProperties = { fontSize: '14px', color: '#9a3412', lineHeight: '1.6', margin: '0', fontWeight: '500' }
const button: React.CSSProperties = {
  backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 28px',
  borderRadius: '8px', fontSize: '15px', fontWeight: '600', textDecoration: 'none',
  display: 'inline-block',
}
const smallText: React.CSSProperties = { fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 24px' }
const link: React.CSSProperties = { color: '#2563eb', textDecoration: 'underline' }
const hr: React.CSSProperties = { borderColor: '#e2e8f0', margin: '24px 0' }
const footer: React.CSSProperties = { fontSize: '12px', color: '#94a3b8', margin: '0' }
