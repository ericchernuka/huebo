import * as stylex from '@stylexjs/stylex'
import { useState, type KeyboardEvent } from 'react'
import { hsbToHex } from '../../shared/color'
import { colors, motion } from '../../shared/tokens.stylex'
import { STEPS, type Hue, type Pick } from '../color'

const ROWS = STEPS.toReversed()
const LAST = STEPS.length - 1

type Cell = { readonly column: number; readonly row: number }

export type SwatchGridProps = {
  readonly hue: Hue
  /** Called with the picked square, or null to clear the pick. */
  readonly onPick: (pick: Pick | null) => void
  readonly pick: Pick | null
  /** The grid is square: this sets its width and spacing. */
  readonly style?: stylex.StyleXStyles
}

export function SwatchGrid({ hue, onPick, pick, style }: SwatchGridProps) {
  const [focus, setFocus] = useState<Cell>(() =>
    pick ? cellOf(pick) : { column: 0, row: 0 },
  )

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && pick) {
      onPick(null)

      return
    }

    const next = moveFocus(event.key, focus)

    if (next) {
      event.preventDefault()
      setFocus(next)

      const cells = event.currentTarget.querySelectorAll('button')

      cells[next.row * STEPS.length + next.column]?.focus()
    }
  }

  return (
    <table
      aria-label={`Saturation and brightness for hue ${hue} degrees`}
      onKeyDown={onKeyDown}
      role="grid"
      tabIndex={-1}
      {...stylex.props(styles.grid, style)}
    >
      <tbody {...stylex.props(styles.contents)}>
        {ROWS.map((brightness, row) => (
          <tr key={brightness} {...stylex.props(styles.contents)}>
            {STEPS.map((saturation, column) => {
              const square = { brightness, saturation }

              const selected =
                pick?.saturation === saturation &&
                pick.brightness === brightness

              return (
                <Swatch
                  focusable={focus.row === row && focus.column === column}
                  hue={hue}
                  key={saturation}
                  onPress={() => {
                    setFocus({ column, row })
                    onPick(selected ? null : square)
                  }}
                  selected={selected}
                  square={square}
                />
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

type SwatchProps = {
  readonly focusable: boolean
  readonly hue: Hue
  readonly onPress: () => void
  readonly selected: boolean
  readonly square: Pick
}

function Swatch({ focusable, hue, onPress, selected, square }: SwatchProps) {
  const { brightness, saturation } = square
  const hex = hsbToHex(hue, saturation, brightness)

  return (
    <td
      aria-selected={selected}
      {...stylex.props(styles.slot, selected && styles.raised)}
    >
      <button
        aria-label={`Saturation ${saturation}, brightness ${brightness}, ${hex}`}
        onClick={onPress}
        tabIndex={focusable ? 0 : -1}
        type="button"
        {...stylex.props(
          styles.cell,
          styles.fill(hex),
          selected && styles.selected,
        )}
      />
    </td>
  )
}

function cellOf(pick: Pick): Cell {
  return {
    column: STEPS.indexOf(pick.saturation),
    row: ROWS.indexOf(pick.brightness),
  }
}

function clamp(index: number): number {
  return Math.min(LAST, Math.max(0, index))
}

function moveFocus(key: string, { column, row }: Cell): Cell | null {
  switch (key) {
    case 'ArrowUp':
      return { column, row: clamp(row - 1) }
    case 'ArrowDown':
      return { column, row: clamp(row + 1) }
    case 'ArrowLeft':
      return { column: clamp(column - 1), row }
    case 'ArrowRight':
      return { column: clamp(column + 1), row }
    case 'Home':
      return { column: 0, row }
    case 'End':
      return { column: LAST, row }
    default:
      return null
  }
}

const styles = stylex.create({
  cell: {
    aspectRatio: 1,
    display: 'block',
    borderRadius: '12%',
    borderWidth: 0,
    cursor: 'pointer',
    minWidth: 0,
    outline: { default: 'none', ':focus-visible': `3px solid ${colors.ink}` },
    outlineOffset: 2,
    padding: 0,
    transitionDuration: motion.quick,
    transitionProperty: 'transform, border-radius',
    width: '100%',
  },
  fill: (color: string) => ({ backgroundColor: color }),
  grid: {
    aspectRatio: 1,
    display: 'grid',
    gap: 3,
    gridTemplateColumns: 'repeat(8, 1fr)',
    width: '100%',
  },
  contents: { display: 'contents' },
  raised: { zIndex: { default: 2, ':focus-within': 3 } },
  slot: {
    display: 'block',
    padding: 0,
    position: 'relative',
    zIndex: { default: null, ':focus-within': 3 },
  },
  selected: {
    borderRadius: '50%',
    boxShadow: `0 0 0 3px #fff, 0 0 0 5px ${colors.ink}`,
    transform: 'scale(1.3)',
  },
})
