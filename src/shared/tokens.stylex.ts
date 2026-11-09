import * as stylex from '@stylexjs/stylex'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

/** The current hue in unitless degrees. The picker sets it on its root. */
export const hue = stylex.defineVars({ degrees: '60' })

/**
 * The page takes on the current hue. On an element with `hueTheme` applied,
 * every colour below follows `hue.degrees`. The values are HSB colours
 * converted to HSL so CSS can derive them: ink hsb(h,60,20), muted ink
 * hsb(h,40,38) and accent hsb(h,85,92). The page background, hsb(h,12,90),
 * is painted on the root by the picker instead.
 */
export const colors = stylex.defineVars({
  accent: 'hsl(60 83% 52.9%)',
  ink: 'hsl(60 42.9% 14%)',
  inkMuted: 'hsl(60 25% 30.4%)',
  panel: 'rgb(255 255 255 / 0.74)',
})

/** Derives the colours from `hue.degrees` on the element it's applied to. */
export const hueTheme = stylex.createTheme(colors, {
  accent: `hsl(${hue.degrees} 83% 52.9%)`,
  ink: `hsl(${hue.degrees} 42.9% 14%)`,
  inkMuted: `hsl(${hue.degrees} 25% 30.4%)`,
  panel: 'rgb(255 255 255 / 0.74)',
})

/** Durations. All of them drop to zero when the viewer asks for reduced motion. */
export const motion = stylex.defineVars({
  fade: { default: '500ms', [REDUCED_MOTION]: '0s' },
  pop: { default: '320ms', [REDUCED_MOTION]: '0s' },
  quick: { default: '180ms', [REDUCED_MOTION]: '0s' },
})

export const radii = stylex.defineVars({
  card: '24px',
  pill: '999px',
})
