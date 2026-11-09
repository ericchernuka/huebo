import {
  createContext,
  use,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { hueAt, type Hue } from '../color'
import type { DialMotion } from './dial-motion'
import { describeHue, shortestTurn } from './geometry'
import type { Motion, MotionEvent } from './motion'

export type DialState = {
  /** The hue on show, including one in motion. */
  readonly hue: Hue
  readonly motion: Motion
  /** Tells the motion machine what an input did. */
  readonly send: (event: MotionEvent) => void
  /** The thumb's rotation in degrees. It never wraps, so 355° → 0° turns forward one notch. */
  readonly turn: number
}

const DialContext = createContext<DialState | null>(null)

export type RootProps = {
  readonly children: ReactNode
  readonly dial: DialMotion
  readonly hue: Hue
  readonly motion: Motion
}

/** Shares the hue on show and the motion machine with the dial's parts. */
export function Root({ children, dial, hue, motion }: RootProps) {
  // The winding number can't be derived from the hue alone, so the turn is
  // kept and nudged the short way round whenever the hue moves.
  const [turn, setTurn] = useState<number>(hue)
  const pointing = hueAt(turn)

  if (pointing !== hue) {
    setTurn(turn + shortestTurn(pointing, hue))
  }

  return (
    <DialContext
      value={{ hue, motion, send: event => dial.send(event, hue), turn }}
    >
      {children}
    </DialContext>
  )
}

export function useDial(): DialState {
  const dial = use(DialContext)

  if (!dial) {
    throw new Error('HueDial parts must be inside <HueDial.Root>.')
  }

  return dial
}

/** Arrow keys step 5°, or 45° with Shift. Page keys always step 45°. */
const KEY_STEPS = new Map([
  ['ArrowDown', -5],
  ['ArrowLeft', -5],
  ['ArrowRight', 5],
  ['ArrowUp', 5],
  ['PageDown', -45],
  ['PageUp', 45],
])

/**
 * The ARIA slider props and keys shared by the ring and the wheel. A held
 * key previews on every repeat and commits once, when it comes up or focus
 * leaves.
 */
export function useHueSlider() {
  const { hue, send } = useDial()

  const onKeyDown = (event: KeyboardEvent) => {
    const input = keyInput(event)

    if (input) {
      event.preventDefault()
      send(input)
    }
  }

  return {
    'aria-label': 'Hue',
    'aria-valuemax': 355,
    'aria-valuemin': 0,
    'aria-valuenow': hue,
    'aria-valuetext': describeHue(hue),
    onBlur: () => send({ type: 'letGo' }),
    onKeyDown,
    onKeyUp: (event: KeyboardEvent) =>
      keyInput(event) && send({ type: 'letGo' }),
    role: 'slider',
    tabIndex: 0,
  } as const
}

function keyInput(event: KeyboardEvent): MotionEvent | null {
  if (event.key === 'Home' || event.key === 'End') {
    return { hue: hueAt(event.key === 'Home' ? 0 : 355), type: 'aim' }
  }

  const step = KEY_STEPS.get(event.key)

  if (step === undefined) {
    return null
  }

  const shifted = event.shiftKey && Math.abs(step) === 5

  return { by: shifted ? step * 9 : step, type: 'nudge' }
}
