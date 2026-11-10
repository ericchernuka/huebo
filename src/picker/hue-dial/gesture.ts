import { recordSample, type Sample } from './inertia'

const TAP_SLOP_PX = 6

export type Pointer = {
  readonly pointerId: number
  readonly time: number
  readonly x: number
}

/** One finger on the phone wheel, from landing to lifting. */
export type Gesture = {
  readonly fromEdge: boolean
  readonly dragging: boolean
  readonly pointerId: number
  readonly radius: number
  readonly samples: ReadonlyArray<Sample>
  readonly startAt: number
  readonly startX: number
}

export type Landing = Pointer & {
  readonly fromEdge: boolean
  readonly radius: number
}

/**
 * A finger landing with the wheel at `startAt`. One that catches a coast is
 * dragging from the start, so lifting it can't read as a tap.
 */
export function startGesture(
  finger: Landing,
  startAt: number,
  caught: boolean,
): Gesture {
  return {
    dragging: caught,
    fromEdge: finger.fromEdge,
    pointerId: finger.pointerId,
    radius: finger.radius,
    samples: [{ time: finger.time, x: finger.x }],
    startAt,
    startX: finger.x,
  }
}

/** The gesture once its finger moves to `pointer`. */
export function moveGesture(gesture: Gesture, pointer: Pointer): Gesture {
  return {
    ...gesture,
    dragging:
      gesture.dragging || Math.abs(pointer.x - gesture.startX) > TAP_SLOP_PX,
    samples: recordSample(gesture.samples, {
      time: pointer.time,
      x: pointer.x,
    }),
  }
}

/** The wheel's rotation with the finger at `x`, in degrees. */
export function dragTurn(gesture: Gesture, x: number): number {
  return (
    gesture.startAt - ((x - gesture.startX) / gesture.radius) * (180 / Math.PI)
  )
}
