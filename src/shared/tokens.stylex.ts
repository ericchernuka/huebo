import * as stylex from '@stylexjs/stylex'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

/** The current hue in unitless degrees. The picker sets it on its root. */
export const hue = stylex.defineVars({ degrees: '60' })

export const colors = stylex.defineVars({
  accent: 'hsl(60 83% 52.9%)',
  ink: 'hsl(60 42.9% 14%)',
  inkMuted: 'hsl(60 25% 30.4%)',
  panel: 'rgb(255 255 255 / 0.74)',
})

export const hueTheme = stylex.createTheme(colors, {
  accent: `hsl(${hue.degrees} 83% 52.9%)`,
  ink: `hsl(${hue.degrees} 42.9% 14%)`,
  inkMuted: `hsl(${hue.degrees} 25% 30.4%)`,
  panel: 'rgb(255 255 255 / 0.74)',
})

/** Curves that overshoot and settle back: a pop for toasts, a gentler one for sliding pills. */
export const easing = stylex.defineVars({
  pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  slide: 'cubic-bezier(0.3, 1.25, 0.5, 1)',
})

export const motion = stylex.defineVars({
  fade: { default: '500ms', [REDUCED_MOTION]: '0s' },
  pop: { default: '320ms', [REDUCED_MOTION]: '0s' },
  quick: { default: '180ms', [REDUCED_MOTION]: '0s' },
  stagger: { default: '45ms', [REDUCED_MOTION]: '0s' },
})

/** While a pointer drags the dial, colours follow it at once instead of easing behind it. */
export const instantMotion = stylex.createTheme(motion, {
  fade: '0s',
  pop: '0s',
  quick: '0s',
  stagger: '0s',
})

export const radii = stylex.defineVars({
  card: '24px',
  pill: '999px',
})
