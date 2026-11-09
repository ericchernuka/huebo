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

export function Root({ children, dial, hue, motion }: RootProps) {
  const turn = useWindingTurn(hue)

  return (
    <DialContext
      value={{ hue, motion, send: event => dial.send(event, hue), turn }}
    >
      {children}
    </DialContext>
  )
}

/** A rotation that follows `hue` the short way round, so it can pass 355° → 0°. */
function useWindingTurn(hue: Hue): number {
  const [turn, setTurn] = useState<number>(hue)
  const pointing = hueAt(turn)

  if (pointing !== hue) {
    setTurn(turn + shortestTurn(pointing, hue))
  }

  return turn
}

export function useDial(): DialState {
  const dial = use(DialContext)

  if (!dial) {
    throw new Error('HueDial parts must be inside <HueDial.Root>.')
  }

  return dial
}

const STEP = 5
const BIG_STEP = 45

const KEY_STEPS = new Map([
  ['ArrowDown', -STEP],
  ['ArrowLeft', -STEP],
  ['ArrowRight', STEP],
  ['ArrowUp', STEP],
  ['PageDown', -BIG_STEP],
  ['PageUp', BIG_STEP],
])

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

  const shifted = event.shiftKey && Math.abs(step) === STEP

  return { by: shifted ? Math.sign(step) * BIG_STEP : step, type: 'nudge' }
}
