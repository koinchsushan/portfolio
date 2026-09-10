/**
 * Fetches the site's own display typeface (Archivo, the same family
 * `src/app/fonts.ts` self-hosts for the live site) for `next/og`'s
 * `ImageResponse`, so generated OG images read in the site's own type
 * rather than Satori's built-in fallback.
 *
 * `next/font/google`'s own downloaded file is not reachable from here (it
 * lands inside the build's own `.next` output, keyed by a hash this module
 * has no stable way to predict), so this fetches the same public Google
 * Fonts file directly. Satori (what `ImageResponse` renders through) does
 * not understand WOFF2, and Google Fonts serves that to any modern browser
 * user agent, so the request below claims an old browser UA specifically
 * to get back a format Satori can parse (a plain WOFF, in Archivo's case).
 *
 * Every failure mode (offline build, Google Fonts unreachable, an
 * unexpected response shape) resolves to `null` rather than throwing:
 * a build must never fail, and an OG image must never go unrendered, for
 * the sake of typeface fidelity. Callers render without a custom `fonts`
 * entry when this returns `null`, which still renders correctly in the
 * site's palette, just in Satori's own default sans.
 */
export async function loadArchivoBold(): Promise<ArrayBuffer | null> {
  try {
    const cssResponse = await fetch('https://fonts.googleapis.com/css2?family=Archivo:wght@800', {
      headers: {
        // A pre-woff2-era user agent: Google Fonts serves this one a plain
        // TTF `src` url instead of a woff2 one.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.9 Safari/536.5',
      },
    })
    if (!cssResponse.ok) return null

    const css = await cssResponse.text()
    const match = css.match(/src:\s*url\(([^)]+)\)/)
    const fontUrl = match?.[1]
    if (!fontUrl) return null

    const fontResponse = await fetch(fontUrl)
    if (!fontResponse.ok) return null

    return await fontResponse.arrayBuffer()
  } catch {
    return null
  }
}
