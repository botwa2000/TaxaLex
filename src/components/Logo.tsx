import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  showWordmark?: boolean
}

const sizes = {
  sm: 28,
  md: 36,
  lg: 48,
}

// The logo PNG has a white background. In dark mode we wrap it in a white
// rounded chip so it reads correctly against dark surfaces.
function LogoMark({ size = 'md' }: Pick<LogoProps, 'size'>) {
  const px = sizes[size]
  return (
    <span className="inline-flex items-center justify-center rounded-lg dark:bg-white dark:p-0.5">
      <Image
        src="/images/logo.png"
        alt="TaxaLex"
        width={px}
        height={px}
        className="object-contain"
        priority
      />
    </span>
  )
}

export function Logo({ size = 'md', href = '/' }: Omit<LogoProps, 'showWordmark'>) {
  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
        <LogoMark size={size} />
      </Link>
    )
  }
  return <LogoMark size={size} />
}
