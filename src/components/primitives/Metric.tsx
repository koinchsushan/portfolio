/**
 * A large tabular figure. Deliberately renders just the value (a `span`,
 * not a `dt`/`dd` pair) so call sites keep their own correct semantic
 * wrapper (`dt`, `dd`, a plain paragraph) around it.
 */
export function Metric({
  value,
  size = 'lg',
  tone = 'bone',
  className = '',
}: {
  value: string
  size?: 'sm' | 'md' | 'lg'
  tone?: 'bone' | 'signal'
  className?: string
}) {
  const valueSize = size === 'lg' ? 'text-40' : size === 'md' ? 'text-28' : 'text-18'
  const valueColor = tone === 'signal' ? 'text-signal' : 'text-bone'

  return (
    <span className={`font-mono ${valueSize} ${valueColor} leading-none tabular-nums ${className}`}>
      {value}
    </span>
  )
}
