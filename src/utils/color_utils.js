/**
 * Converts an HSB value to RGB
 * @param {Number} h Hue
 * @param {Number} s Saturation
 * @param {Number} b Brightness
 */
export function hsb2Rgb(h, s, b) {
  const hue = h / 360
  const saturation = s / 100
  const brightness = b / 100
  const i = Math.floor(hue * 6)
  const f = hue * 6 - i
  const p = brightness * (1 - saturation)
  const q = brightness * (1 - f * saturation)
  const t = brightness * (1 - (1 - f) * saturation)

  const sectors = [
    [brightness, t, p],
    [q, brightness, p],
    [p, brightness, t],
    [p, q, brightness],
    [t, p, brightness],
    [brightness, p, q],
  ]

  const [red, green, blue] = sectors[i % 6]

  return {
    b: Math.round(blue * 255),
    g: Math.round(green * 255),
    r: Math.round(red * 255),
  }
}

/**
 * Converts HSB to Hex
 * @param {Number} h Hue
 * @param {Number} s Saturation
 * @param {Number} b Brightness
 */
export function hsb2Hex(h, s, b) {
  const { b: blue, g: green, r: red } = hsb2Rgb(h, s, b)

  return (
    '#' +
    ((1 << 24) + (red << 16) + (green << 8) + blue)
      .toString(16)
      .slice(1, 7)
      .toUpperCase()
  )
}
