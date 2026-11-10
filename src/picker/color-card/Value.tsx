import * as stylex from '@stylexjs/stylex'
import { colors } from '../../shared/tokens.stylex'
import { useCard } from './ColorCardRoot'

export function Value({ style }: { readonly style?: stylex.StyleXStyles }) {
  const { format, values } = useCard()
  const value = values?.text[format]

  return (
    <output {...stylex.props(styles.value, style)}>
      {value ?? <span {...stylex.props(styles.empty)}>Pick a colour</span>}
    </output>
  )
}

/** The widest value, such as `255,255,128`, in ems of the value's own type. */
const WIDEST_VALUE_EM = 5.8

/** Room beside the value for Copy's widest label and the row's gap. */
const COPY_ROOM_PX = 140

const styles = stylex.create({
  empty: {
    color: colors.inkMuted,
    fontSize: 'clamp(18px, 5cqi, 22px)',
    fontWeight: 400,
    letterSpacing: 0,
    whiteSpace: 'normal',
  },
  value: {
    // Sized so the widest value still fits beside Copy, rather than pushing
    // it onto the next line.
    fontSize: `clamp(26px, calc((100cqi - ${COPY_ROOM_PX}px) / ${WIDEST_VALUE_EM}), 54px)`,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
})
