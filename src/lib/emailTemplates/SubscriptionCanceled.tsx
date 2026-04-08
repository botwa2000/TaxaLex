import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from '@react-email/components'
import { brand } from '@/config/brand'
import { config } from '@/config/env'

interface Props {
  userName?: string | null
  planName: string
  validUntil?: string  // formatted date string
}

export function SubscriptionCanceled({ userName, planName, validUntil }: Props) {
  const greeting = userName ? `Hallo ${userName},` : 'Hallo,'
  const billingUrl = `${config.appUrl}/de/billing`

  return (
    <Html lang="de">
      <Head />
      <Preview>Ihr Abonnement wurde gekündigt – Zugang noch bis {validUntil ?? 'Periodenende'}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>{brand.name}</Text>
          </Section>

          <Heading style={heading}>Abonnement gekündigt</Heading>

          <Text style={text}>{greeting}</Text>
          <Text style={text}>
            Ihre Kündigung des Abonnements <strong>{planName}</strong> wurde erfolgreich
            verarbeitet. Wir bedauern, Sie zu verlieren.
          </Text>

          {validUntil ? (
            <Section style={infoCard}>
              <Text style={infoText}>
                Ihr Zugang bleibt bis <strong>{validUntil}</strong> vollständig erhalten.
                Bis zu diesem Datum können Sie weiterhin alle Funktionen nutzen und
                Einsprüche erstellen.
              </Text>
            </Section>
          ) : (
            <Text style={text}>
              Ihr Zugang bleibt bis zum Ende des aktuellen Abrechnungszeitraums erhalten.
            </Text>
          )}

          <Text style={text}>
            Möchten Sie {brand.name} weiterhin nutzen? Sie können Ihr Abonnement jederzeit
            erneut aktivieren und sofort wieder unbegrenzt Einsprüche erstellen.
          </Text>

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={billingUrl} style={button}>
              Abonnement erneuern
            </Button>
          </Section>

          <Text style={smallText}>
            Falls Sie Fragen zur Kündigung haben oder wir etwas verbessern können,
            melden Sie sich gerne bei uns:{' '}
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
const infoCard: React.CSSProperties = {
  backgroundColor: '#f0f9ff', borderRadius: '8px', padding: '16px 20px',
  margin: '20px 0', border: '1px solid #bae6fd',
}
const infoText: React.CSSProperties = { fontSize: '14px', color: '#0c4a6e', lineHeight: '1.6', margin: '0' }
const button: React.CSSProperties = {
  backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 28px',
  borderRadius: '8px', fontSize: '15px', fontWeight: '600', textDecoration: 'none',
  display: 'inline-block',
}
const smallText: React.CSSProperties = { fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 24px' }
const link: React.CSSProperties = { color: '#2563eb', textDecoration: 'underline' }
const hr: React.CSSProperties = { borderColor: '#e2e8f0', margin: '24px 0' }
const footer: React.CSSProperties = { fontSize: '12px', color: '#94a3b8', margin: '0' }
