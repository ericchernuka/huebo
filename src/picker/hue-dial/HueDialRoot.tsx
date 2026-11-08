import {
  createContext,
  use,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { hueAt, type Hue } from '../color'
import { describeHue, shortestTurn } from './geometry'

export type DialState = {
  /** Commits a hue: the URL and history follow, unless it's the hue already there. Stops any coasting first. */
  readonly commit: (hue: Hue) => void
  readonly hue: Hue
  /** Shows a hue mid-gesture without touching the URL. */
  readonly preview: (hue: Hue) => void
  /** Set by a part while it's in motion; calling it stops that motion. */
  readonly stopMotionRef: RefObject<(() => void) | null>
  /** The thumb's rotation in degrees. It never wraps, so 355° → 0° turns forward one notch. */
  readonly turn: number
}

const DialContext = createContext<DialState | null>(null)

export type RootProps = {
  readonly children: ReactNode
  readonly hue: Hue
  readonly onCommit: (hue: Hue) => void
  readonly onPreview: (hue: Hue) => void
}

/**
 * Holds the hue for its parts. `hue` is what's showing now, including a
 * preview mid-gesture. Parts call `onPreview` while a finger is down and
 * `onCommit` once a choice is made, so Back steps through chosen colours.
 */
export function Root({ children, hue, onCommit, onPreview }: RootProps) {
  const [rotation, setRotation] = useState({ hue, turn: Number(hue) })
  const stopMotionRef = useRef<(() => void) | null>(null)

  if (rotation.hue !== hue) {
    setRotation({ hue, turn: rotation.turn + shortestTurn(rotation.hue, hue) })
  }

  const commit = (next: Hue) => {
    stopMotionRef.current?.()
    stopMotionRef.current = null
    onCommit(next)
  }

  return (
    <DialContext
      value={{
        commit,
        hue,
        preview: onPreview,
        stopMotionRef,
        turn: rotation.turn,
      }}
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

/** The ARIA slider props and keyboard steps shared by the ring and the wheel. */
export function useHueSlider() {
  const { commit, hue, preview } = useDial()

  // A held key is a gesture like a drag: it previews on every repeat and
  // commits once, when the key comes up or focus leaves mid-hold.
  const onKeyDown = (event: KeyboardEvent) => {
    const target = keyTarget(event, hue)

    if (target !== null) {
      event.preventDefault()
      preview(target)
    }
  }

  const onKeyUp = (event: KeyboardEvent) => {
    if (keyTarget(event, hue) !== null) {
      commit(hue)
    }
  }

  return {
    'aria-label': 'Hue',
    'aria-valuemax': 355,
    'aria-valuemin': 0,
    'aria-valuenow': hue,
    'aria-valuetext': describeHue(hue),
    onBlur: () => commit(hue),
    onKeyDown,
    onKeyUp,
    role: 'slider',
    tabIndex: 0,
  } as const
}

function keyTarget(event: KeyboardEvent, hue: Hue): Hue | null {
  if (event.key === 'Home') {
    return hueAt(0)
  }

  if (event.key === 'End') {
    return hueAt(355)
  }

  const step = KEY_STEPS.get(event.key)

  if (step === undefined) {
    return null
  }

  return hueAt(hue + (event.shiftKey && Math.abs(step) === 5 ? step * 9 : step))
}
