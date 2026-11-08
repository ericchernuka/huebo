import * as stylex from '@stylexjs/stylex'
import { colors } from './tokens.stylex'

/** The few styles more than one slice needs. */
export const shared = stylex.create({
  focusRing: {
    outline: {
      default: 'none',
      ':focus-visible': `3px solid ${colors.ink}`,
    },
    outlineOffset: 3,
  },
  visuallyHidden: {
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    whiteSpace: 'nowrap',
    width: 1,
  },
})
