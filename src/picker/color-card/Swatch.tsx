import * as stylex from '@stylexjs/stylex'
import { colors, motion, radii } from '../../shared/tokens.stylex'
import { useCard } from './ColorCardRoot'

/** The picked colour as a block, or a dashed outline while nothing is picked. */
export function Swatch({ style }: { readonly style?: stylex.StyleXStyles }) {
  const { values } = useCard()

  return (
    <div
      aria-hidden="true"
      {...stylex.props(
        styles.swatch,
        values ? styles.picked(values.text.Hex) : styles.empty,
        style,
      )}
    />
  )
}

const styles = stylex.create({
  empty: {
    borderColor: colors.inkMuted,
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  picked: (hex: string) => ({ backgroundColor: hex }),
  swatch: {
    borderRadius: `${radii.card} ${radii.card} 4px 4px`,
    height: 120,
    transitionDuration: motion.quick,
    transitionProperty: 'background-color',
  },
})
