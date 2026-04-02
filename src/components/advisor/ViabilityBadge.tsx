import { Badge } from '@/components/ui/Badge'
import type { ViabilityScore } from '@/types'

const variantMap: Record<ViabilityScore, 'success' | 'warning' | 'danger'> = {
  HIGH: 'success',
  MEDIUM: 'warning',
  LOW: 'danger',
}

interface Props {
  score: ViabilityScore
  summary?: string | null
  size?: 'sm' | 'md'
}

export function ViabilityBadge({ score, summary, size = 'md' }: Props) {
  const labels: Record<ViabilityScore, string> = {
    HIGH: 'Hohe Erfolgsaussicht',
    MEDIUM: 'Mittlere Erfolgsaussicht',
    LOW: 'Geringe Erfolgsaussicht',
  }

  return (
    <span title={summary ?? undefined}>
      <Badge variant={variantMap[score]} size={size}>
        {labels[score]}
      </Badge>
    </span>
  )
}
