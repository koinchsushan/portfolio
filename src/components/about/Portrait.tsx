import { existsSync } from 'node:fs'
import path from 'node:path'
import Image from 'next/image'

const PORTRAIT_PATH = '/sushan.jpg'
// A conservative headshot ratio (4:5). Nothing here is a design flourish ,
// it is the box next/image needs reserved before the real file exists, so
// swapping the photo in later causes no layout shift.
const WIDTH = 240
const HEIGHT = 300

function portraitFileExists(): boolean {
  try {
    return existsSync(path.join(process.cwd(), 'public', 'sushan.jpg'))
  } catch {
    return false
  }
}

/**
 * The About portrait. The source is an 800x800 JPEG at `public/sushan.jpg`,
 * downsampled from a 1.7MB PNG: it renders at 240px, so 800 covers 3x retina
 * with room to spare and costs 113KB instead of 1.76MB.
 *
 * The filesystem check stays. It costs nothing at build time, and it means a
 * missing or renamed file degrades to a sized placeholder rather than
 * shipping a broken image on a live page.
 *
 * The photograph renders plain. A duotone treatment was tried and the owner
 * asked for it removed: it is his face, and mapping it into the palette read
 * as a filter rather than as a portrait.
 */
export function Portrait({ className = '' }: { className?: string }) {
  const hasPhoto = portraitFileExists()

  return (
    <div
      className={`relative isolate w-full max-w-[240px] overflow-hidden border border-grid bg-panel ${className}`.trim()}
      style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
    >
      {hasPhoto ? (
        <>
          <Image
            src={PORTRAIT_PATH}
            alt="Sushan Sunuwar, head and shoulders, in a dark blazer against a bright office interior"
            width={WIDTH}
            height={HEIGHT}
            sizes="240px"
            className="h-full w-full object-cover"
          />
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
          <span className="font-mono text-12 uppercase tracking-[0.14em] text-label">Portrait pending</span>
        </div>
      )}
    </div>
  )
}
