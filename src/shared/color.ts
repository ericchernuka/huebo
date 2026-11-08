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

  // The six 60° sectors of the colour wheel, in the original's order.
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
  const hex = hsbToRgb(hue, saturation, brightness)
    .map(channel => channel.toString(16).padStart(2, '0'))
    .join('')

  return `#${hex.toUpperCase()}`
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
