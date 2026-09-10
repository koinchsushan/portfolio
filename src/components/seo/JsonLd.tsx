/**
 * Renders one JSON-LD block. `JSON.stringify` alone does not sanitize
 * against XSS (a `</script>` inside a string value could close the tag
 * early), so every `<` is escaped to its unicode equivalent first, exactly
 * as the Next.js JSON-LD guide recommends.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
