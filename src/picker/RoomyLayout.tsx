import * as stylex from '@stylexjs/stylex'
import { ColorCard } from './color-card'
import { HueDial } from './hue-dial'
import type { LayoutProps } from './layout'
import { SwatchGrid } from './swatch-grid/SwatchGrid'

/** Tablets and desktops: the ring around the grid, beside the card or above it. */
export function RoomyLayout({ color, header, onPick }: LayoutProps) {
  return (
    <div {...stylex.props(styles.layout)}>
      <header {...stylex.props(styles.head)}>{header}</header>
      <div {...stylex.props(styles.dial)}>
        <div {...stylex.props(styles.ring)}>
          <HueDial.Ring>
            <SwatchGrid hue={color.hue} onPick={onPick} pick={color.pick} />
          </HueDial.Ring>
        </div>
        <HueDial.Stepper>
          <HueDial.Decrement />
          <HueDial.Degrees />
          <HueDial.Increment />
        </HueDial.Stepper>
      </div>
      <div {...stylex.props(styles.card)}>
        <ColorCard.Root color={color}>
          <ColorCard.Swatch />
          <ColorCard.Panel>
            <ColorCard.Format />
            <div {...stylex.props(styles.valueRow)}>
              <ColorCard.Value />
              <ColorCard.Copy />
            </div>
            <ColorCard.Details />
          </ColorCard.Panel>
        </ColorCard.Root>
      </div>
    </div>
  )
}

/** Below this width the ring sits above the card instead of beside it. */
const STACKED = '@media (max-width: 959px)'

const styles = stylex.create({
  card: {
    gridArea: 'card',
    maxWidth: { [STACKED]: 560 },
    textAlign: 'start',
    width: '100%',
  },
  dial: {
    alignSelf: 'center',
    display: 'grid',
    gap: 18,
    gridArea: 'dial',
    justifyItems: 'center',
  },
  head: {
    alignItems: 'center',
    alignSelf: 'end',
    display: 'flex',
    gap: 8,
    gridArea: 'head',
    justifyContent: { [STACKED]: 'center' },
    maxWidth: { [STACKED]: 560 },
    width: { [STACKED]: '100%' },
  },
  layout: {
    alignContent: { default: 'center', [STACKED]: 'start' },
    alignItems: 'start',
    columnGap: { default: 56, [STACKED]: 24 },
    display: 'grid',
    gridTemplateAreas: {
      default: '"dial head" "dial card"',
      [STACKED]: '"head" "dial" "card"',
    },
    gridTemplateColumns: {
      default: 'auto minmax(0, 1fr)',
      [STACKED]: 'minmax(0, 1fr)',
    },
    justifyItems: { [STACKED]: 'center' },
    marginInline: 'auto',
    maxWidth: 1120,
    minHeight: '100svh',
    padding: 24,
    rowGap: 24,
  },
  // As big as the screen allows while the stepper (and, when stacked, the
  // title and card) still fit without scrolling. Never below 332px, where
  // the grid's cells would fall under a 24px pitch.
  ring: {
    width: {
      default: 'max(332px, min(88vw, 520px, calc(100svh - 150px)))',
      [STACKED]: 'max(332px, min(84vw, 480px, calc(100svh - 560px)))',
    },
  },
  valueRow: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 16,
  },
})
