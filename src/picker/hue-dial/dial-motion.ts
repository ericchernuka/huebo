import { useState, useSyncExternalStore } from 'react'
import { hsbToHex } from '../../shared/color'
import { hueAt, type Color, type Hue } from '../color'
import { describeHue } from './geometry'
import {
  destination,
  IDLE,
  transition,
  type Commit,
  type Motion,
  type MotionEvent,
} from './motion'

const SCROLL_PAUSE_MS = 250

/** The longest frame a coast advances by, so a stalled tab doesn't jump. */
const MAX_FRAME_MS = 40

export type DialMotion = ReturnType<typeof createDialMotion>

/** The page around the dial: the link that choices land in, and a voice. */
type DialPage = {
  /** The colour in the link, as the page last rendered it. */
  readonly link: () => Color
  /** Puts `color` in the link. Resolves once the page shows it. */
  readonly go: (color: Color) => Promise<void>
  /** Calls `traversed` on Back, Forward or a jump through history. */
  readonly onTraverse: (traversed: () => void) => () => void
  readonly announce: (text: string) => void
}

function createDialMotion() {
  let motion: Motion = IDLE
  let lastShown: Hue = hueAt(0)
  let onCommit: ((commit: Commit) => void) | null = null
  const listeners = new Set<() => void>()

  const send = (event: MotionEvent, shown: Hue = lastShown) => {
    lastShown = shown

    const next = transition(motion, event, shown)

    if (next.motion !== motion) {
      motion = next.motion
      listeners.forEach(listener => listener())
    }

    clocks.follow(motion, event)

    if (next.commit) {
      onCommit?.(next.commit)
    }
  }

  const clocks = createClocks(send)

  const landIn = (page: DialPage) => (commit: Commit) => {
    const link = page.link()
    const next = destination(commit, link)
    const landed = () => send({ hue: commit.hue, type: 'landed' })

    if (next === null) {
      landed()

      return
    }

    if (commit.announce) {
      page.announce(describeLanding(commit, link))
    }

    void page.go(next).then(landed)
  }

  return {
    /** Lands every choice in `page`'s link until the returned function disconnects it. */
    connect: (page: DialPage) => {
      onCommit = landIn(page)
      const unlisten = page.onTraverse(() => send({ type: 'traverse' }))

      return () => {
        onCommit = null
        unlisten()
        clocks.stop()
      }
    },
    get: () => motion,
    send,
    subscribe: (listener: () => void) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
  }
}

function describeLanding({ hue, pick }: Commit, link: Color): string {
  if (pick) {
    return `Picked ${hsbToHex(hue, pick.saturation, pick.brightness)}`
  }

  return pick === null && hue === link.hue
    ? 'Selection cleared'
    : `Hue ${describeHue(hue)}`
}

function createClocks(send: (event: MotionEvent) => void) {
  let frame = 0
  let lastFrame = 0
  let pause: ReturnType<typeof setTimeout> | undefined

  const tick = (now: number) => {
    const elapsed = Math.min(now - lastFrame, MAX_FRAME_MS)

    lastFrame = now
    frame = 0
    send({ elapsed, type: 'frame' })
  }

  return {
    follow(motion: Motion, event: MotionEvent) {
      if (motion.kind !== 'coasting') {
        cancelAnimationFrame(frame)
        frame = 0
      } else if (frame === 0) {
        lastFrame = event.type === 'frame' ? lastFrame : performance.now()
        frame = requestAnimationFrame(tick)
      }

      if (motion.kind !== 'scrolling' || event.type === 'scroll') {
        clearTimeout(pause)
      }

      if (motion.kind === 'scrolling' && event.type === 'scroll') {
        pause = setTimeout(() => send({ type: 'pause' }), SCROLL_PAUSE_MS)
      }
    },
    stop() {
      cancelAnimationFrame(frame)
      frame = 0
      clearTimeout(pause)
    },
  }
}

/** One motion machine for the page's lifetime, and its current state. */
export function useDialMotion(): readonly [Motion, DialMotion] {
  const [dial] = useState(createDialMotion)
  const motion = useSyncExternalStore(dial.subscribe, dial.get)

  return [motion, dial]
}
