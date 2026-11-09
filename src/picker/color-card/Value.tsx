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

const styles = stylex.create({
  empty: {
    color: colors.inkMuted,
    fontSize: 'clamp(18px, 5cqi, 22px)',
    fontWeight: 400,
    letterSpacing: 0,
    whiteSpace: 'normal',
  },
  value: {
    fontSize: 'clamp(28px, 12cqi, 54px)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
})
