import * as stylex from '@stylexjs/stylex'
import { useId } from 'react'
import { shared } from '../../shared/styles'
import { colors, easing, motion, radii } from '../../shared/tokens.stylex'
import { useCard } from './ColorCardRoot'
import { FORMATS } from '../formats'

export function Format() {
  const { format, setFormat } = useCard()
  const name = useId()

  return (
    <div
      aria-label="Colour format"
      role="radiogroup"
      {...stylex.props(styles.group)}
    >
      <span
        aria-hidden="true"
        {...stylex.props(
          styles.pill,
          styles.at(FORMATS.indexOf(format), FORMATS.length),
        )}
      />
      {FORMATS.map(option => (
        <label
          key={option}
          {...stylex.props(styles.option, option === format && styles.checked)}
        >
          <input
            checked={option === format}
            name={name}
            onChange={() => setFormat(option)}
            type="radio"
            value={option}
            {...stylex.props(shared.focusRing, styles.input)}
          />
          {option}
        </label>
      ))}
    </div>
  )
}

const styles = stylex.create({
  at: (index: number, count: number) => ({
    transform: `translateX(${index * 100}%)`,
    width: `calc((100% - 8px) / ${count})`,
  }),
  checked: { color: '#fff' },
  group: {
    backgroundColor: 'rgb(0 0 0 / 0.07)',
    borderRadius: radii.pill,
    display: 'inline-grid',
    justifySelf: 'start',
    gridAutoColumns: '1fr',
    gridAutoFlow: 'column',
    padding: 4,
    position: 'relative',
  },
  input: {
    appearance: 'none',
    borderRadius: radii.pill,
    cursor: 'pointer',
    inset: 0,
    margin: 0,
    position: 'absolute',
  },
  option: {
    alignItems: 'center',
    borderRadius: radii.pill,
    cursor: 'pointer',
    display: 'inline-flex',
    fontSize: 15,
    fontWeight: 600,
    justifyContent: 'center',
    minHeight: 38,
    paddingInline: 16,
    position: 'relative',
    transitionDuration: motion.quick,
    transitionProperty: 'color',
    userSelect: 'none',
  },
  pill: {
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    bottom: 4,
    left: 4,
    position: 'absolute',
    top: 4,
    transitionDuration: motion.pop,
    transitionProperty: 'transform',
    transitionTimingFunction: easing.slide,
  },
})
