import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from '@react-email/components'
import { brand } from '@/config/brand'

interface Props {
  advisorName?: string | null
  briefSummary: string
  amountDisputed: number
  deadlineDate: string | null
  viabilityScore: 'HIGH' | 'MEDIUM' | 'LOW'
  reviewUrl: string
}

export function AdvisorHandoffNotification({
  advisorName,
  briefSummary,
  amountDisputed,
  deadlineDate,
  viabilityScore,
  reviewUrl,
}: Props) {
  const greeting = advisorName ? `Hallo ${advisorName},` : 'Hallo,'

  const viabilityLabel = {
    HIGH: 'Hohe Erfolgsaussicht',
    MEDIUM: 'Mittlere Erfolgsaussicht',
    LOW: 'Geringe Erfolgsaussicht',
  }[viabilityScore]

  const viabilityColor = {
    HIGH: '#16a34a',
    MEDIUM: '#d97706',
    LOW: '#dc2626',
  }[viabilityScore]

  const amountFormatted = `€${amountDisputed.toLocaleString('de-DE')}`
  const deadlineText = deadlineDate
    ? new Date(deadlineDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Kein Datum'

  return (
    <Html lang="de">
      <Head />
      <Preview>Neue Fallprüfung: {briefSummary}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>{brand.name}</Text>
          </Section>

          <Heading style={heading}>Neue Fallprüfung angefragt</Heading>

          <Text style={text}>{greeting}</Text>
          <Text style={text}>
            Ein Mandant hat eine Prüfung seines Einspruchentwurfs angefragt.
            Die vollständigen Unterlagen stehen in Ihrer Beratungsplattform bereit.
          </Text>

          <Section style={caseCard}>
            <Text style={caseTitle}>{briefSummary}</Text>
            <Text style={caseMeta}>
              <span style={{ color: viabilityColor, fontWeight: '700' }}>{viabilityLabel}</span>
              {'  ·  '}
              <strong>{amountFormatted}</strong> strittig
              {'  ·  '}
              Frist: <strong>{deadlineText}</strong>
            </Text>
          </Section>

          <Text style={text}>
            Sie haben 48 Stunden, um den Fall anzunehmen oder abzulehnen.
            Falls keine Rückmeldung erfolgt, wird die Anfrage automatisch freigegeben.
          </Text>

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={reviewUrl} style={button}>
              Fall ansehen & entscheiden
            </Button>
          </Section>

          <Text style={smallText}>
            Bitte leiten Sie diese E-Mail nicht weiter — der Link ist personalisiert
            und gewährt Zugang zu vertraulichen Mandantendaten.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            © {new Date().getFullYear()} {brand.name} — Bad Homburg vor der Höhe
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
const caseCard: React.CSSProperties = {
  backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px 20px',
  margin: '20px 0', border: '1px solid #e2e8f0',
}
const caseTitle: React.CSSProperties = { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '0 0 6px' }
const caseMeta: React.CSSProperties = { fontSize: '14px', color: '#475569', margin: '0' }
const button: React.CSSProperties = {
  backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 28px',
  borderRadius: '8px', fontSize: '15px', fontWeight: '600', textDecoration: 'none',
  display: 'inline-block',
}
const smallText: React.CSSProperties = { fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 24px' }
const hr: React.CSSProperties = { borderColor: '#e2e8f0', margin: '24px 0' }
const footer: React.CSSProperties = { fontSize: '12px', color: '#94a3b8', margin: '0' }
