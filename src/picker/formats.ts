import { contrastRatio, hsbToRgb, rgbToHex, type Rgb } from '../shared/color'
import type { Color } from './color'

export const FORMATS = ['HSB', 'RGB', 'Hex'] as const

export type Format = (typeof FORMATS)[number]

export type Values = {
  readonly rgb: Rgb
  readonly text: Readonly<Record<Format, string>>
}

export function valuesOf({ hue, pick }: Color): Values | null {
  if (pick === null) {
    return null
  }

  const { brightness, saturation } = pick
  const rgb = hsbToRgb(hue, saturation, brightness)

  return {
    rgb,
    text: {
      HSB: `${hue},${saturation},${brightness}`,
      Hex: rgbToHex(rgb),
      RGB: rgb.join(','),
    },
  }
}

const TEXT_COLOURS = [
  { name: 'White', rgb: [255, 255, 255], swatch: '#fff' },
  { name: 'Black', rgb: [0, 0, 0], swatch: '#000' },
] as const satisfies ReadonlyArray<{ name: string; rgb: Rgb; swatch: string }>

export type TextContrast = {
  readonly grade: 'AAA' | 'AA' | 'AA large' | 'fails'
  readonly name: (typeof TEXT_COLOURS)[number]['name']
  /** The WCAG 2 ratio, for comparing. */
  readonly exactRatio: number
  /** The WCAG 2 ratio, rounded down to one decimal so it never overstates. */
  readonly ratio: number
  readonly swatch: string
}

/** How white and black text read on `background`. */
export function textContrast(background: Rgb): ReadonlyArray<TextContrast> {
  return TEXT_COLOURS.map(({ name, rgb, swatch }) => {
    const ratio = contrastRatio(rgb, background)

    return {
      exactRatio: ratio,
      grade: grade(ratio),
      name,
      ratio: Math.floor(ratio * 10) / 10,
      swatch,
    }
  })
}

/** The WCAG 2 level a contrast ratio reaches for normal or large text. */
function grade(ratio: number): TextContrast['grade'] {
  if (ratio >= 7) {
    return 'AAA'
  }

  if (ratio >= 4.5) {
    return 'AA'
  }

  return ratio >= 3 ? 'AA large' : 'fails'
}
