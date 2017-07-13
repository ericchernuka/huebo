function hsb2Hsl(h, s, b) {
  if (b === 0) {
    return { h: 0, s: 0, l: 0 }
  }

  const lightness = (2 - s / 100) * b / 2
  const saturation = s * b / (lightness < 50 ? lightness * 2 : 200 - lightness * 2)

  return {
    h,
    s: saturation,
    l: lightness,
  }
}

function hslString() {
  const { h, s, l } = hsb2Hsl(...arguments)
  return `hsl(${h},${s}%,${l}%)`
}

function hsb2Rgb(h, s, b) {
  const hue = h / 360
  const saturation = s / 100
  const brightness = b / 100
  let red, green, blue

  const i = Math.floor(hue * 6)
  const f = hue * 6 - i
  const p = brightness * (1 - saturation)
  const q = brightness * (1 - f * saturation)
  const t = brightness * (1 - (1 - f) * saturation)

  switch (i % 6) {
    case 0: red = brightness, green = t, blue = p; break
    case 1: red = q, green = brightness, blue = p; break
    case 2: red = p, green = brightness, blue = t; break
    case 3: red = p, green = q, blue = brightness; break
    case 4: red = t, green = p, blue = brightness; break
    case 5: red = brightness, green = p, blue = q; break
  }

  return {
    r: Math.round(red * 255),
    g: Math.round(green * 255),
    b: Math.round(blue * 255),
  }
}

function hsb2Hex(h, s, b) {
  const { r: red, g: green, b: blue } = hsb2Rgb(...arguments)

  return "#" + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1,7)
}

export {
  hsb2Hsl,
  hsb2Rgb,
  hsb2Hex,
  hslString,
}