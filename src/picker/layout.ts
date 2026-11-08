import type { ReactNode } from 'react'
import type { Color, Pick } from './color'

/** What the page hands each layout. `color.hue` is the hue on show, including a preview. */
export type LayoutProps = {
  readonly color: Color
  readonly header: ReactNode
  readonly onPick: (pick: Pick | null) => void
}

/**
 * Phones, plus mid-width windows too short for the ring and the card to fit
 * one above the other.
 */
export const COMPACT_QUERY =
  '(max-width: 599px), (max-width: 959px) and (max-height: 939px)'
