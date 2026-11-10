import { contrastRatio, hexToRgb, hsbToHex, type Rgb } from '../shared/color'
import { type Color, hueAt, pageBackground } from './color'

export type LetterColour = {
  readonly brightness: number
  readonly letter: string
  readonly hex: string
  readonly hue: number
  readonly saturation: number
}

const LETTER_TURN_DEGREES = 15

const UNPICKED = { brightness: 75, saturation: 88 }

const WCAG_LARGE_TEXT_CONTRAST = 3

export function wordmarkColours(
  color: Color,
  letters: ReadonlyArray<string>,
): ReadonlyArray<LetterColour> {
  const { saturation, brightness } = color.pick ?? UNPICKED
  const background = hexToRgb(pageBackground(color.hue))

  return letters.map((letter, index) => {
    const hue = hueAt(color.hue + index * LETTER_TURN_DEGREES)

    const readable = darkenUntilReadable(
      { brightness, hue, saturation },
      background,
    )

    return {
      brightness: readable,
      hex: hsbToHex(hue, saturation, readable),
      hue,
      letter,
      saturation,
    }
  })
}

type Hsb = { brightness: number; hue: number; saturation: number }

function darkenUntilReadable(
  { brightness, hue, saturation }: Hsb,
  background: Rgb,
): number {
  let readable = brightness

  while (
    readable > 0 &&
    contrastRatio(hexToRgb(hsbToHex(hue, saturation, readable)), background) <
      WCAG_LARGE_TEXT_CONTRAST
  ) {
    readable -= 1
  }

  return readable
}
