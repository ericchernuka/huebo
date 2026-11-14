import * as stylex from '@stylexjs/stylex'
import { colors, easing, motion } from '../shared/tokens.stylex'
import type { Color } from './color'
import { wordmarkColours } from './wordmark-colours'

const LETTERS = Array.from('Huebo')

export function Wordmark({ color }: { readonly color: Color }) {
  return (
    <h1
      aria-label="Huebo"
      {...stylex.props(stylex.defaultMarker(), styles.title)}
    >
      {wordmarkColours(color, LETTERS).map(({ hex, letter }, index) => (
        <span
          aria-hidden="true"
          key={letter}
          {...stylex.props(styles.letter(hex, String(index)))}
        >
          {letter}
        </span>
      ))}
    </h1>
  )
}

const styles = stylex.create({
  letter: (hoverColour: string, place: string) => ({
    color: {
      default: colors.ink,
      [stylex.when.ancestor(':hover')]: hoverColour,
    },
    display: 'inline-block',
    transform: {
      default: 'none',
      [stylex.when.ancestor(':hover')]: 'translateY(-2px)',
    },
    transitionDelay: `calc(${motion.stagger} * ${place})`,
    transitionDuration: motion.pop,
    transitionProperty: 'color, transform',
    transitionTimingFunction: easing.pop,
  }),
  title: {
    cursor: 'default',
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: '-0.01em',
    margin: 0,
  },
})
