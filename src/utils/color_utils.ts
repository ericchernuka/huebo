/**
 * Converts an HSB value to RGB
 * @param h Hue
 * @param s Saturation
 * @param b Brightness
 */
export function hsb2Rgb(h: number, s: number, b: number) {
  const hue = h / 360;
  const saturation = s / 100;
  const brightness = b / 100;
  let red: number, green: number, blue: number;

  const i = Math.floor(hue * 6);
  const f = hue * 6 - i;
  const p = brightness * (1 - saturation);
  const q = brightness * (1 - f * saturation);
  const t = brightness * (1 - (1 - f) * saturation);

  switch (i % 6) {
    case 0: {
      red = brightness;
      green = t;
      blue = p;
      break;
    }
    case 1: {
      red = q;
      green = brightness;
      blue = p;
      break;
    }
    case 2: {
      red = p;
      green = brightness;
      blue = t;
      break;
    }
    case 3: {
      red = p;
      green = q;
      blue = brightness;
      break;
    }
    case 4: {
      red = t;
      green = p;
      blue = brightness;
      break;
    }
    case 5: {
      red = brightness;
      green = p;
      blue = q;
      break;
    }
    default:
      red = 0;
      green = 0;
      blue = 0;
      break;
  }

  return {
    r: Math.round(red * 255),
    g: Math.round(green * 255),
    b: Math.round(blue * 255),
  };
}

/**
 * Converts HSB to Hex
 * @param h Hue
 * @param s Saturation
 * @param b Brightness
 */
export function hsb2Hex(h: number, s: number, b: number): string {
  const { r: red, g: green, b: blue } = hsb2Rgb(h, s, b);

  return (
    '#' +
    ((1 << 24) + (red << 16) + (green << 8) + blue)
      .toString(16)
      .slice(1, 7)
      .toUpperCase()
  );
}
