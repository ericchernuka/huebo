import type { Color, Pick } from './color'

/** What the page hands each layout. `color.hue` is the hue on show, including a preview. */
export type LayoutProps = {
  readonly color: Color
  readonly onPick: (pick: Pick | null) => void
}

export const COMPACT_QUERY =
  '(max-width: 599px), (max-width: 959px) and (max-height: 939px)'
