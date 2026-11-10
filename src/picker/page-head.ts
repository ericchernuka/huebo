import { hsbToHex, hsbToRgb } from '../shared/color'
import { HUES, linkPath, STEPS, type Color } from './color'

const SITE_ORIGIN = 'https://huebo.ericchernuka.com'

/** What a page tells search engines and link previews about itself. */
export type PageHead = {
  readonly description: string
  /** The title a link preview shows, without the site name. */
  readonly headline: string
  readonly path: string
  readonly title: string
}

export const HOME_HEAD: PageHead = {
  description:
    'Turn the dial to find a hue, then pick one of its 64 shades. Copy it as HSB, RGB or Hex. HSB is also called HSV.',
  headline: 'Huebo: Dial in your colour',
  path: '/',
  title: 'Huebo: Dial in your colour (HSB/HSV picker)',
}

export function pageHead(color: Color): PageHead {
  const { hue, pick } = color

  if (pick === null) {
    const headline = `Hue ${hue} and its 64 shades`

    return {
      description: `Every saturation and brightness step of hue ${hue}, from nearly white to nearly black. Pick one to copy it.`,
      headline,
      path: linkPath(color),
      title: `${headline} | Huebo`,
    }
  }

  const { brightness, saturation } = pick
  const hex = hsbToHex(hue, saturation, brightness)
  const rgb = hsbToRgb(hue, saturation, brightness).join(' ')
  const headline = `${hex} · HSB ${hue} ${saturation} ${brightness}`

  return {
    description: `${hex} is HSB ${hue}° ${saturation}% ${brightness}% and RGB ${rgb}. Open it to try a nearby shade or copy it in another format.`,
    headline,
    path: linkPath(color),
    title: `${headline} | Huebo`,
  }
}

/** Every colour with a link: each hue alone, then with each of its 64 picks. */
export function everyColor(): ReadonlyArray<Color> {
  return HUES.flatMap(hue => [
    { hue, pick: null },
    ...STEPS.flatMap(brightness =>
      STEPS.map(saturation => ({ hue, pick: { brightness, saturation } })),
    ),
  ])
}

/**
 * The pages worth a search engine's time: home and the 72 hues. Picks stay
 * out; there are thousands, and each says little a hex lookup site doesn't.
 */
export function sitemap(): string {
  const urls = [HOME_HEAD, ...HUES.map(hue => pageHead({ hue, pick: null }))]
    .map(({ path }) => `  <url><loc>${SITE_ORIGIN}${path}</loc></url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

type HeadTag = {
  readonly name: string
  /** Matches the tag, with the text before and after its value as groups 1 and 2. */
  readonly pattern: RegExp
  readonly value: (head: PageHead, url: string) => string
}

/** A `<meta>` tag in `index.html`, found by its `name` or `property`. */
function metaTag(
  key: 'name' | 'property',
  name: string,
  value: HeadTag['value'],
): HeadTag {
  return {
    name,
    pattern: new RegExp(`(<meta\\s+${key}="${name}"\\s+content=")[^"]*(")`),
    value,
  }
}

/** The tags in `index.html` that carry the home head. */
const HEAD_TAGS: ReadonlyArray<HeadTag> = [
  {
    name: 'title',
    pattern: /(<title>)[^<]*(<\/title>)/,
    value: head => head.title,
  },
  {
    name: 'canonical',
    pattern: /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    value: (_, url) => url,
  },
  metaTag('name', 'description', head => head.description),
  metaTag('property', 'og:title', head => head.headline),
  metaTag('property', 'og:description', head => head.description),
  metaTag('property', 'og:url', (_, url) => url),
]

/**
 * Writes `head` into the built `index.html`. Throws when a tag is missing, so
 * a change to `index.html` can't quietly ship every link with the home head.
 */
export function withHead(html: string, head: PageHead): string {
  const url = `${SITE_ORIGIN}${head.path}`

  return HEAD_TAGS.reduce((page, { name, pattern, value }) => {
    if (!pattern.test(page)) {
      throw new Error(`index.html has no ${name} tag to fill`)
    }

    return page.replace(
      pattern,
      (_, before: string, after: string) =>
        `${before}${escapeAttribute(value(head, url))}${after}`,
    )
  }, html)
}

function escapeAttribute(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
}
