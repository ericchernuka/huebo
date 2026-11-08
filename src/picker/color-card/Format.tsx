import * as stylex from '@stylexjs/stylex'
import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { shared } from '../../shared/styles'
import { colors, motion, radii } from '../../shared/tokens.stylex'
import { useCard } from './ColorCardRoot'
import { FORMATS, type Format as FormatName } from './formats'

/**
 * Switches the value between HSB, RGB and Hex. The options share one width,
 * so a single pill can slide under whichever is chosen.
 */
export function Format() {
  const { format, setFormat } = useCard()

  return (
    <RadioGroup<FormatName>
      aria-label="Colour format"
      onValueChange={setFormat}
      value={format}
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
        <Radio.Root
          className={state =>
            stylex.props(
              shared.focusRing,
              styles.option,
              state.checked && styles.checked,
            ).className
          }
          key={option}
          value={option}
        >
          {option}
        </Radio.Root>
      ))}
    </RadioGroup>
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
    // Hug the options, even as a grid or flex item.
    justifySelf: 'start',
    gridAutoColumns: '1fr',
    gridAutoFlow: 'column',
    padding: 4,
    position: 'relative',
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
    // A touch of overshoot so the pill lands rather than stops.
    transitionTimingFunction: 'cubic-bezier(0.3, 1.25, 0.5, 1)',
  },
})
