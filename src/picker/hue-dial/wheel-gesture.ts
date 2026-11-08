import { useRef, useState, type PointerEvent } from 'react'
import { useAnnounce } from '../../shared/announcer'
import { hueAt } from '../color'
import { describeHue } from './geometry'
import { useDial } from './HueDialRoot'
import {
  coast,
  flickVelocity,
  recordSample,
  type Coast,
  type Sample,
} from './inertia'

/** Pointer downs this close to a side edge belong to the system's back swipe. */
const EDGE = 24

/** Less movement than this is a tap. */
const TAP = 6
const DEGREES_PER_RADIAN = 180 / Math.PI

type Gesture = {
  readonly fromEdge: boolean
  moved: boolean
  samples: Array<Sample>
  readonly startTurn: number
  readonly startX: number
}

type WheelGeometry = {
  readonly radius: number
  /** How far below the top of the wheel's box the top of the wheel sits. */
  readonly top: number
}

/**
 * Drives the wheel: drag sideways to turn it, flick to let it coast, or tap a
 * segment to jump to it. Returns the wheel's rotation, whether a finger or
 * momentum is moving it, and the pointer handlers for its box.
 */
export function useWheelGesture(wheel: WheelGeometry) {
  const { commit, hue, preview, stopMotionRef, turn } = useDial()
  const announce = useAnnounce()
  // The wheel's free rotation while a finger or momentum moves it, else null.
  const [free, setFree] = useState<number | null>(null)
  const gestureRef = useRef<Gesture | null>(null)

  const follow = (at: number) => {
    setFree(at)
    preview(hueAt(at))
  }

  // Committing runs the dial's stopMotion, which is `halt` while this moves.
  const settle = (at: number) => {
    commit(hueAt(at))
    announce(`Hue ${describeHue(hueAt(at))}`)
  }

  const momentum = useCoast(follow, settle)

  const halt = () => {
    momentum.stop()
    setFree(null)
  }

  const finish = () => (free === null ? halt() : settle(free))

  const release = (ended: Gesture, event: PointerEvent<HTMLElement>) => {
    if (!ended.moved) {
      commit(hueAt(hue + tapAngle(event, wheel)))
    } else if (ended.fromEdge) {
      finish()
    } else {
      const flick = flickOf(ended, event, wheel.radius)

      if (flick.velocity === null) {
        settle(flick.turn)
      } else {
        momentum.start({ turn: flick.turn, velocity: flick.velocity })
      }
    }
  }

  const handlers = {
    onPointerCancel: () => {
      gestureRef.current = null
      finish()
    },
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      // Touching a coasting wheel catches it, and counts as a drag.
      const caught = momentum.stop()

      stopMotionRef.current = halt
      event.currentTarget.setPointerCapture(event.pointerId)
      gestureRef.current = startGesture(event, caught, free ?? turn)
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const current = gestureRef.current

      if (current && track(current, event)) {
        follow(dragTurn(current, event.clientX, wheel.radius))
      }
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      const ended = gestureRef.current

      gestureRef.current = null

      if (ended) {
        release(ended, event)
      }
    },
  }

  return { handlers, moving: free !== null, rotation: free ?? turn }
}

/** Runs a coast frame by frame until it comes to rest. */
function useCoast(
  onFrame: (turn: number) => void,
  onRest: (turn: number) => void,
) {
  const frameRef = useRef(0)

  const start = (from: Coast) => {
    let state = from
    let last = performance.now()

    const step = (now: number) => {
      const next = coast(state, Math.min(now - last, 40))

      last = now

      if (next === null) {
        frameRef.current = 0
        onRest(state.turn)
      } else {
        state = next
        onFrame(next.turn)
        frameRef.current = requestAnimationFrame(step)
      }
    }

    frameRef.current = requestAnimationFrame(step)
  }

  /** Stops the coast, returning whether one was running. */
  const stop = () => {
    const running = frameRef.current !== 0

    cancelAnimationFrame(frameRef.current)
    frameRef.current = 0

    return running
  }

  return { start, stop }
}

function startGesture(
  event: PointerEvent<HTMLElement>,
  caught: boolean,
  startTurn: number,
): Gesture {
  return {
    fromEdge: event.clientX < EDGE || event.clientX > window.innerWidth - EDGE,
    moved: caught,
    samples: [{ time: event.timeStamp, x: event.clientX }],
    startTurn,
    startX: event.clientX,
  }
}

/** Records a move, returning whether it should turn the wheel. */
function track(gesture: Gesture, event: PointerEvent<HTMLElement>): boolean {
  gesture.moved ||= Math.abs(event.clientX - gesture.startX) > TAP
  gesture.samples = recordSample(gesture.samples, {
    time: event.timeStamp,
    x: event.clientX,
  })

  return gesture.moved && !gesture.fromEdge
}

/** Where a drag let go, and how fast it was spinning, unless motion is reduced. */
function flickOf(
  gesture: Gesture,
  event: PointerEvent<HTMLElement>,
  radius: number,
) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  return {
    turn: dragTurn(gesture, event.clientX, radius),
    velocity: reduced
      ? null
      : flickVelocity(gesture.samples, event.timeStamp, radius),
  }
}

/** Sliding a finger along the wheel's top edge turns it by the arc travelled. */
function dragTurn(gesture: Gesture, x: number, radius: number): number {
  return (
    gesture.startTurn - ((x - gesture.startX) / radius) * DEGREES_PER_RADIAN
  )
}

/** The angle from the pin to a tap, measured at the wheel's centre. */
function tapAngle(
  event: PointerEvent<HTMLElement>,
  { radius, top }: WheelGeometry,
): number {
  const box = event.currentTarget.getBoundingClientRect()
  const centreX = box.left + box.width / 2
  const centreY = box.top + top + radius

  return (
    Math.atan2(event.clientX - centreX, centreY - event.clientY) *
    DEGREES_PER_RADIAN
  )
}
