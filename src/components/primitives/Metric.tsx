export type MetricSize = 'sm' | 'md' | 'lg'
export type MetricTone = 'bone' | 'signal'

/**
 * The one definition of how a figure looks, exported so `CountUpMetric` can
 * wear exactly the same face without a second copy of it drifting apart.
 */
export function metricClass(size: MetricSize = 'lg', tone: MetricTone = 'bone'): string {
  const valueSize = size === 'lg' ? 'text-40' : size === 'md' ? 'text-28' : 'text-18'
  const valueColor = tone === 'signal' ? 'text-signal' : 'text-bone'
  return `font-mono ${valueSize} ${valueColor} leading-none tabular-nums`
}

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
  size?: MetricSize
  tone?: MetricTone
  className?: string
}) {
  return <span className={`${metricClass(size, tone)} ${className}`}>{value}</span>
}
