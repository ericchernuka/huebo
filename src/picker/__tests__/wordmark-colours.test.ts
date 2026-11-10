import { describe, expect, test } from 'vitest'
import { contrastRatio, hexToRgb } from '../../shared/color'
import { HUES, STEPS, hueAt, pageBackground } from '../color'
import { wordmarkColours } from '../wordmark-colours'

const WCAG_LARGE_TEXT_CONTRAST = 3

function firstLetters(count: number) {
  return Array.from('Huebo').slice(0, count)
}

describe('given the title', () => {
  test('when nothing is picked, then its letters start at the hue and walk round to its neighbours', () => {
    const letters = wordmarkColours(
      { hue: hueAt(200), pick: null },
      firstLetters(5),
    )

    expect(letters.map(letter => letter.hue)).toEqual([200, 215, 230, 245, 260])
  })

  test('when the hue is near the end of the circle, then its letters wrap past 355 to 0', () => {
    const letters = wordmarkColours(
      { hue: hueAt(340), pick: null },
      firstLetters(3),
    )

    expect(letters.map(letter => letter.hue)).toEqual([340, 355, 10])
  })

  test('when a dark pick is made, then its letters take the pick’s saturation and brightness', () => {
    const pick = { brightness: 50, saturation: 75 } as const
    const letters = wordmarkColours({ hue: hueAt(120), pick }, firstLetters(5))

    for (const letter of letters) {
      expect(letter).toMatchObject(pick)
    }
  })

  test('when any hue and pick are shown, then every letter reads against the page at 3:1 or better', () => {
    const picks = [
      null,
      ...STEPS.flatMap(saturation =>
        STEPS.map(brightness => ({ brightness, saturation })),
      ),
    ]

    for (const hue of HUES) {
      const background = hexToRgb(pageBackground(hue))

      for (const pick of picks) {
        for (const letter of wordmarkColours({ hue, pick }, firstLetters(5))) {
          const ratio = contrastRatio(hexToRgb(letter.hex), background)

          expect(ratio).toBeGreaterThanOrEqual(WCAG_LARGE_TEXT_CONTRAST)
        }
      }
    }
  })

  test('when a pale pick is made, then its letters keep the pick’s saturation and only darken', () => {
    const pick = { brightness: 100, saturation: 12 } as const
    const letters = wordmarkColours({ hue: hueAt(60), pick }, firstLetters(5))

    for (const letter of letters) {
      expect(letter.saturation).toBe(12)
      expect(letter.brightness).toBeLessThan(100)
    }
  })
})
