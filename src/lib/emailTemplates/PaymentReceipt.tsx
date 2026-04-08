import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from '@react-email/components'
import { brand } from '@/config/brand'
import { config } from '@/config/env'

interface Props {
  userName?: string | null
  planName: string
  creditsGranted?: number
  amountPaid: number      // in cents
  currency: string        // 'eur'
  invoiceUrl?: string
  mode: 'payment' | 'subscription'
  locale?: string
}

export function PaymentReceipt({
  userName,
  planName,
  creditsGranted,
  amountPaid,
  currency,
  invoiceUrl,
  mode,
}: Props) {
  const greeting = userName ? `Hallo ${userName},` : 'Hallo,'

  // Format cents → €X,XX
  const amountFormatted = (amountPaid / 100).toLocaleString('de-DE', {
    style: 'currency',
    currency: currency.toUpperCase(),
  })

  const einspruchUrl = `${config.appUrl}/de/einspruch`

  return (
    <Html lang="de">
      <Head />
      <Preview>Zahlung eingegangen – vielen Dank! {planName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>{brand.name}</Text>
          </Section>

          <Heading style={heading}>Zahlung eingegangen – vielen Dank!</Heading>

          <Text style={text}>{greeting}</Text>
          <Text style={text}>
            Ihre Zahlung für <strong>{planName}</strong> über <strong>{amountFormatted}</strong> wurde
            erfolgreich verarbeitet. Vielen Dank für Ihr Vertrauen in {brand.name}.
          </Text>

          <Section style={receiptCard}>
            <Text style={receiptLabel}>Gebuchter Plan</Text>
            <Text style={receiptValue}>{planName}</Text>
            <Text style={receiptLabel}>Betrag</Text>
            <Text style={receiptValue}>{amountFormatted}</Text>
          </Section>

          {creditsGranted && creditsGranted > 0 ? (
            <Text style={text}>
              <strong>{creditsGranted} {creditsGranted === 1 ? 'Credit wurde' : 'Credits wurden'}</strong> Ihrem
              Konto gutgeschrieben und stehen sofort zur Verfügung.
            </Text>
          ) : null}

          {mode === 'subscription' ? (
            <Text style={text}>
              Ihr Abonnement ist jetzt aktiv. Sie können unbegrenzt Einsprüche erstellen.
            </Text>
          ) : null}

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={einspruchUrl} style={button}>
              Jetzt Einspruch erstellen
            </Button>
          </Section>

          {invoiceUrl ? (
            <Text style={invoiceLinkText}>
              <a href={invoiceUrl} style={link}>Rechnung herunterladen</a>
            </Text>
          ) : null}

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
const receiptCard: React.CSSProperties = {
  backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px 20px',
  margin: '20px 0', border: '1px solid #e2e8f0',
}
const receiptLabel: React.CSSProperties = { fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '8px 0 2px' }
const receiptValue: React.CSSProperties = { fontSize: '15px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px' }
const button: React.CSSProperties = {
  backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 28px',
  borderRadius: '8px', fontSize: '15px', fontWeight: '600', textDecoration: 'none',
  display: 'inline-block',
}
const invoiceLinkText: React.CSSProperties = { fontSize: '13px', color: '#64748b', textAlign: 'center', margin: '0 0 24px' }
const link: React.CSSProperties = { color: '#2563eb', textDecoration: 'underline' }
const hr: React.CSSProperties = { borderColor: '#e2e8f0', margin: '24px 0' }
const footer: React.CSSProperties = { fontSize: '12px', color: '#94a3b8', margin: '0' }
