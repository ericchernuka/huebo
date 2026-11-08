import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { colors, radii } from '../../shared/tokens.stylex'

type PanelProps = {
  readonly children: ReactNode
  readonly style?: stylex.StyleXStyles
}

/** The frosted panel under the swatch. Its width is a container the value sizes against. */
export function Panel({ children, style }: PanelProps) {
  return <div {...stylex.props(styles.panel, style)}>{children}</div>
}

const styles = stylex.create({
  panel: {
    backdropFilter: 'blur(8px)',
    backgroundColor: colors.panel,
    borderRadius: `4px 4px ${radii.card} ${radii.card}`,
    containerType: 'inline-size',
    padding: '20px 22px 22px',
  },
})
