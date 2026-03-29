import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  showWordmark?: boolean
}

const sizes = {
  sm: { box: 'w-7 h-7 rounded-md', symbol: 'text-sm', wordmark: 'text-base' },
  md: { box: 'w-8 h-8 rounded-lg', symbol: 'text-base', wordmark: 'text-lg' },
  lg: { box: 'w-10 h-10 rounded-xl', symbol: 'text-lg', wordmark: 'text-xl' },
}

// "TaxaLex" → "Tax" + "a" + "Lex"
// Tax and Lex share one color; "a" is the visual connector in a lighter shade
function LogoMark({ size = 'md', showWordmark = true }: LogoProps) {
  const s = sizes[size]
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.box} bg-brand-600 flex items-center justify-center shrink-0`}>
        <span className={`${s.symbol} font-bold text-white leading-none`}>§</span>
      </div>
      {showWordmark && (
        <span className={`${s.wordmark} font-bold tracking-tight leading-none`}>
          <span className="text-brand-700">Tax</span>
          <span className="text-brand-300">a</span>
          <span className="text-brand-700">Lex</span>
        </span>
      )}
    </div>
  )
}

export function Logo({ size = 'md', href = '/', showWordmark = true }: LogoProps) {
  if (href) {
    return (
      <Link href={href} className="flex items-center hover:opacity-90 transition-opacity">
        <LogoMark size={size} showWordmark={showWordmark} />
      </Link>
    )
  }
  return <LogoMark size={size} showWordmark={showWordmark} />
}
