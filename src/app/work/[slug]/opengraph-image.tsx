import { ImageResponse } from 'next/og'
import { caseStudies, getCaseStudy } from '@/content'
import { OG_PALETTE } from '@/lib/ogPalette'
import { loadArchivoBold } from '@/lib/ogFont'

export const alt = 'Case study'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }))
}

/**
 * One card per case study, same typographic system as the site default
 * (`app/opengraph-image.tsx`): the same palette, the same attempted
 * typeface, no photograph and no invented logo, just this study's own
 * numbered index, client name, role and dates, and its lead outcome metric
 * (already-verified figures from `src/content/caseStudies.ts`, never a new
 * claim invented for the card). The `[slug]` segment this file shares with
 * `page.tsx` is what varies the image per case study, not
 * `generateImageMetadata` (that convention is for several image variants
 * within one already-resolved route, not for enumerating the slugs
 * themselves, and mixing the two produced a build-time id error here).
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const caseStudy = getCaseStudy(slug)
  const archivoBold = await loadArchivoBold()

  const client = caseStudy?.client ?? 'Case study'
  const roleLine = caseStudy ? `${caseStudy.role} · ${caseStudy.dates}` : ''
  const index = caseStudy?.index ?? ''
  const leadMetric = caseStudy?.outcomes[0]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: OG_PALETTE.ground,
          padding: '80px',
          fontFamily: archivoBold ? 'Archivo' : 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 24,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: OG_PALETTE.label,
          }}
        >
          <div style={{ display: 'flex', color: OG_PALETTE.signal }}>{index}</div>
          Case Study
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', fontSize: 88, fontWeight: 800, color: OG_PALETTE.bone, lineHeight: 1.05 }}>
            {client}
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: OG_PALETTE.label }}>{roleLine}</div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 16,
            fontSize: 22,
            color: OG_PALETTE.label,
            borderTop: `2px solid ${OG_PALETTE.grid}`,
            paddingTop: 28,
          }}
        >
          {leadMetric && (
            <>
              <div style={{ display: 'flex', fontSize: 40, color: OG_PALETTE.signal, fontWeight: 800 }}>
                {leadMetric.value}
              </div>
              <div style={{ display: 'flex' }}>{leadMetric.label}</div>
            </>
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: archivoBold ? [{ name: 'Archivo', data: archivoBold, style: 'normal', weight: 800 }] : undefined,
    },
  )
}
