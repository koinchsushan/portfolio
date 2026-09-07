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
 * The About portrait. `public/sushan.jpg` may not exist yet , the owner has
 * not saved it in , so this checks the filesystem at render time and falls
 * back to a same-size placeholder rather than asking next/image to load a
 * missing file (which would 404 the `<img>`, not fail the build, but would
 * leave a broken image on a shipped page). The moment the real file lands
 * at that path, this renders it with no code change.
 *
 * Duotone: the source photo is cool-toned office light, so mapping its
 * shadows to `--label` and its highlights to `--bone` sits it into the
 * palette instead of reading as a dropped-in headshot. Grayscale first,
 * then two blend layers reproduce the classic two-colour duotone curve:
 * `multiply` with the highlight colour pulls white toward `--bone` while
 * leaving black alone, then `screen` with the shadow colour pulls black
 * toward `--label` while leaving white alone.
 */
export function Portrait() {
  const hasPhoto = portraitFileExists()

  return (
    <div
      className="relative isolate w-full max-w-[240px] overflow-hidden border border-grid bg-panel"
      style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
    >
      {hasPhoto ? (
        <>
          <Image
            src={PORTRAIT_PATH}
            alt="Sushan Sunuwar at his desk, lit by cool grey-blue office light"
            width={WIDTH}
            height={HEIGHT}
            sizes="240px"
            className="h-full w-full object-cover grayscale"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-bone mix-blend-multiply" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-label mix-blend-screen" />
        </>
      ) : (
        <div className="graticule flex h-full w-full flex-col items-center justify-center gap-2 text-center">
          <span className="font-mono text-12 uppercase tracking-[0.14em] text-label">Portrait pending</span>
        </div>
      )}
    </div>
  )
}
