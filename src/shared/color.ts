/** Red, green and blue channels, each an integer from 0 to 255. */
export type Rgb = readonly [red: number, green: number, blue: number]

/**
 * Converts HSB (hue in degrees, saturation and brightness in percent) to RGB.
 * The output matches the original Huebo byte for byte, so shared links keep
 * their colour. `hsb-golden.txt` pins it.
 */
export function hsbToRgb(
  hue: number,
  saturation: number,
  brightness: number,
): Rgb {
  const h = (hue / 360) * 6
  const s = saturation / 100
  const v = brightness / 100
  const f = h - Math.floor(h)
  const p = to255(v * (1 - s))
  const q = to255(v * (1 - f * s))
  const t = to255(v * (1 - (1 - f) * s))
  const max = to255(v)

  switch (Math.floor(h) % 6) {
    case 0:
      return [max, t, p]
    case 1:
      return [q, max, p]
    case 2:
      return [p, max, t]
    case 3:
      return [p, q, max]
    case 4:
      return [t, p, max]
    default:
      return [max, p, q]
  }
}

function to255(unit: number): number {
  return Math.round(unit * 255)
}

export function hsbToHex(
  hue: number,
  saturation: number,
  brightness: number,
): string {
  return rgbToHex(hsbToRgb(hue, saturation, brightness))
}

/** Writes RGB as upper-case Hex, such as `#4998BF`. */
export function rgbToHex(rgb: Rgb): string {
  const hex = rgb.map(channel => channel.toString(16).padStart(2, '0')).join('')

  return `#${hex.toUpperCase()}`
}

/** Reads Hex such as `#4998BF`, `4998bf` or `#fff`. The caller checks its shape. */
export function hexToRgb(hex: string): Rgb {
  const digits = hex.replace('#', '')
  const full = digits.length === 3 ? digits.replaceAll(/./g, '$&$&') : digits
  const channel = (at: number) => Number.parseInt(full.slice(at, at + 2), 16)

  return [channel(0), channel(2), channel(4)]
}

/** How different two colours look, by the "redmean" approximation. Only its order means anything. */
export function colorDistance([r1, g1, b1]: Rgb, [r2, g2, b2]: Rgb): number {
  const red = (r1 + r2) / 2
  const [dr, dg, db] = [r1 - r2, g1 - g2, b1 - b2]

  return (
    (2 + red / 256) * dr ** 2 + 4 * dg ** 2 + (2 + (255 - red) / 256) * db ** 2
  )
}

/** The WCAG 2 contrast ratio between two colours, from 1 to 21. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [la, lb] = [luminance(a), luminance(b)]

  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

function luminance([red, green, blue]: Rgb): number {
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue)
}

function linear(channel: number): number {
  const c = channel / 255

  return c <= 0.039_28 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
