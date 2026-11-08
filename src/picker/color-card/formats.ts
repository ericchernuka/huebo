import * as v from 'valibot'
import { hsbToHex, hsbToRgb, type Rgb } from '../../shared/color'
import type { Color } from '../color'

export const FORMATS = ['HSB', 'RGB', 'Hex'] as const

export type Format = (typeof FORMATS)[number]

/** A picked colour: its channels, and its value written out in every format. */
export type Values = {
  readonly rgb: Rgb
  readonly text: Readonly<Record<Format, string>>
}

/** The picked colour's values, or null when nothing's picked. */
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
      Hex: hsbToHex(hue, saturation, brightness),
      RGB: rgb.join(','),
    },
  }
}

const STORAGE_KEY = 'huebo-format'
const StoredFormat = v.picklist(FORMATS)

/** The viewer's last format, defaulting to Hex. Storage can be missing or blocked. */
export function readFormat(): Format {
  try {
    const stored = v.safeParse(StoredFormat, localStorage.getItem(STORAGE_KEY))

    return stored.success ? stored.output : 'Hex'
  } catch {
    return 'Hex'
  }
}

export function saveFormat(format: Format): void {
  try {
    localStorage.setItem(STORAGE_KEY, format)
  } catch {
    // Private windows and blocked storage just don't remember the choice.
  }
}
