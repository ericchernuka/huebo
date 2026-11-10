import { describe, expect, test } from 'vitest'
import { hueAt } from '../color'
import {
  everyColor,
  HOME_HEAD,
  pageHead,
  sitemap,
  withHead,
} from '../page-head'
import indexHtml from '../../../index.html?raw'

const ROSE = {
  hue: hueAt(340),
  pick: { brightness: 88, saturation: 62 },
} as const

describe('given a colour link', () => {
  test('when it has a pick, then its title leads with the hex', () => {
    expect(pageHead(ROSE)).toEqual({
      description:
        '#E05584 is HSB 340° 62% 88% and RGB 224 85 132. Open it to try a nearby shade or copy it in another format.',
      headline: '#E05584 · HSB 340 62 88',
      path: '/340/62/88',
      title: '#E05584 · HSB 340 62 88 | Huebo',
    })
  })

  test('when it is a hue alone, then its title names the hue', () => {
    const head = pageHead({ hue: hueAt(340), pick: null })

    expect(head.title).toBe('Hue 340 and its 64 shades | Huebo')
    expect(head.path).toBe('/340')
  })

  test('when every link is listed, then each of the 4,680 has its own path', () => {
    const paths = new Set(everyColor().map(color => pageHead(color).path))

    expect(paths.size).toBe(72 + 72 * 64)
  })
})

describe('given the built index.html', () => {
  test('when a pick’s head is written in, then the preview tags describe that colour', () => {
    const page = withHead(indexHtml, pageHead(ROSE))

    expect(page).toContain('<title>#E05584 · HSB 340 62 88 | Huebo</title>')
    expect(page).toContain(
      '<link rel="canonical" href="https://huebo.ericchernuka.com/340/62/88" />',
    )
    expect(page).toContain(
      '<meta property="og:url" content="https://huebo.ericchernuka.com/340/62/88" />',
    )
    expect(page).toContain(
      '<meta property="og:title" content="#E05584 · HSB 340 62 88" />',
    )
    expect(page).not.toContain(HOME_HEAD.description)
  })

  test('when the home head is written in, then the page is unchanged', () => {
    expect(withHead(indexHtml, HOME_HEAD)).toBe(indexHtml)
  })

  test('when a tag is missing, then writing the head throws', () => {
    const page = indexHtml.replace(/<link rel="canonical"[^>]*>/, '')

    expect(() => withHead(page, HOME_HEAD)).toThrow('canonical')
  })
})

describe('given the sitemap', () => {
  test('when it is built, then it lists home and the 72 hues but no picks', () => {
    const locs = sitemap().match(/<loc>[^<]*<\/loc>/g) ?? []

    expect(locs).toHaveLength(73)
    expect(locs).toContain('<loc>https://huebo.ericchernuka.com/340</loc>')
    expect(sitemap()).not.toContain('/340/62/88')
  })
})
