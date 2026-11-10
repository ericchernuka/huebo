import * as stylex from '@stylexjs/stylex'
import { colors } from '../shared/tokens.stylex'
import { ColorCard } from './color-card'
import { HueDial } from './hue-dial'
import { Header } from './Header'
import type { LayoutProps } from './layout'
import { SwatchGrid } from './swatch-grid/SwatchGrid'

// fallow-ignore-next-line code-duplication -- Both layouts open the same way by design; they diverge right after the header.
export function CompactLayout({ color, onPick }: LayoutProps) {
  return (
    <div {...stylex.props(styles.layout)}>
      <header {...stylex.props(styles.head)}>
        <Header color={color} />
      </header>
      <ColorCard.Root color={color}>
        <ColorCard.Swatch style={styles.swatch} />
        <ColorCard.Panel style={styles.panel}>
          <div {...stylex.props(styles.valueRow)}>
            <ColorCard.Value style={styles.value} />
            <ColorCard.Copy />
          </div>
          <ColorCard.Format />
        </ColorCard.Panel>
      </ColorCard.Root>
      <div {...stylex.props(styles.gridBox)}>
        <SwatchGrid
          hue={color.hue}
          onPick={onPick}
          pick={color.pick}
          style={styles.grid}
        />
      </div>
      <HueDial.Stepper style={styles.stepper}>
        <HueDial.Decrement style={styles.stepButton} />
        <HueDial.Degrees style={styles.degrees} />
        <HueDial.Increment style={styles.stepButton} />
      </HueDial.Stepper>
      <HueDial.Wheel style={styles.wheel} />
    </div>
  )
}

/** Below this the page scrolls rather than shrink the grid's cells under a 24px pitch. */
const MIN_ONE_SCREEN_HEIGHT_PX = 650

const GUTTER = 'max(12px, env(safe-area-inset-left))'
const GUTTER_END = 'max(12px, env(safe-area-inset-right))'

const styles = stylex.create({
  degrees: { fontSize: 18 },
  grid: { gap: 4, width: 'min(100cqw, 100cqh)' },
  gridBox: {
    containerType: 'size',
    display: 'grid',
    minHeight: 0,
    placeItems: 'center',
  },
  head: { alignItems: 'center', display: 'flex', gap: 8 },
  layout: {
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr) auto auto',
    height: '100svh',
    minHeight: MIN_ONE_SCREEN_HEIGHT_PX,
    padding: `max(12px, env(safe-area-inset-top)) ${GUTTER_END} 0 ${GUTTER}`,
    rowGap: 12,
  },
  panel: {
    borderRadius: '4px 4px 18px 18px',
    display: 'grid',
    gap: 10,
    padding: '12px 14px 14px',
  },
  stepButton: { backgroundColor: colors.panel, height: 48, width: 48 },
  stepper: {
    backgroundColor: 'transparent',
    marginBottom: -8,
    padding: '0 16px',
    position: 'relative',
    zIndex: 1,
  },
  swatch: { borderRadius: '18px 18px 4px 4px', height: 44 },
  value: { fontSize: 32 },
  valueRow: {
    alignItems: 'center',
    display: 'flex',
    gap: 12,
    justifyContent: 'space-between',
  },
  wheel: {
    marginLeft: `calc(-1 * ${GUTTER})`,
    marginRight: `calc(-1 * ${GUTTER_END})`,
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
  },
})
