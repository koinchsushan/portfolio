import { ImageResponse } from 'next/og'
import { identity } from '@/content'
import { OG_PALETTE } from '@/lib/ogPalette'
import { loadArchivoBold } from '@/lib/ogFont'

export const alt = `${identity.name}, ${identity.title}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * The site's default share card: typographic only, built from the same
 * warm-dark palette as the live site (`OG_PALETTE`, transcribed from
 * `src/styles/tokens.css`) and, where the font fetch succeeds, the site's
 * own Archivo display face. Never the owner's photograph (`Portrait.tsx`
 * is a component for the About section, not a share image) and never an
 * invented logo or wordmark, since neither exists as a real asset for this
 * site, only the name set in type.
 */
export default async function Image() {
  const archivoBold = await loadArchivoBold()

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
            gap: 12,
            fontSize: 24,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: OG_PALETTE.label,
          }}
        >
          <div style={{ width: 10, height: 10, backgroundColor: OG_PALETTE.signal, display: 'flex' }} />
          {identity.strapline}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, color: OG_PALETTE.bone, lineHeight: 1.05 }}>
            {identity.name}
          </div>
          <div style={{ display: 'flex', fontSize: 40, color: OG_PALETTE.signal }}>{identity.tagline}</div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 22,
            color: OG_PALETTE.label,
            borderTop: `2px solid ${OG_PALETTE.grid}`,
            paddingTop: 28,
          }}
        >
          <div style={{ display: 'flex' }}>{identity.title}</div>
          <div style={{ display: 'flex' }}>{identity.location}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: archivoBold ? [{ name: 'Archivo', data: archivoBold, style: 'normal', weight: 800 }] : undefined,
    },
  )
}
