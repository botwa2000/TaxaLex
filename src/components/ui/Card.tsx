import { cn } from '@/lib/utils'

type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps {
  padding?: CardPadding
  hover?: boolean
  highlight?: boolean
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

const paddings: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

function CardRoot({ padding = 'md', hover, highlight, className, children, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--surface)] border border-[var(--border)] rounded-2xl',
        paddings[padding],
        hover && 'hover:shadow-md hover:border-[var(--border-strong)] transition-all cursor-pointer',
        highlight && 'border-brand-400 ring-2 ring-brand-100 dark:ring-brand-900',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('pb-4 border-b border-[var(--border)] mb-4', className)}>
      {children}
    </div>
  )
}

function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('', className)}>{children}</div>
}

function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('pt-4 border-t border-[var(--border)] mt-4', className)}>
      {children}
    </div>
  )
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
})
