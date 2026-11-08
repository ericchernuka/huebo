import * as stylex from '@stylexjs/stylex'
import {
  useEffect,
  useEffectEvent,
  useRef,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { colors, motion } from '../../shared/tokens.stylex'
import { hueAt, type Hue } from '../color'
import { useDial, useHueSlider } from './HueDialRoot'
import { Segments } from './Segments'

/** How long the mouse wheel rests before its turn counts as a choice. */
const WHEEL_PAUSE_MS = 250

/**
 * The full hue ring, with `children` (the grid) in its middle. Click or drag
 * the ring to set the angle; the mouse wheel steps 5°, committing once it
 * pauses. It's a square that fills its container's width.
 */
export function Ring({ children }: { readonly children: ReactNode }) {
  const { commit, hue, preview, turn } = useDial()
  const slider = useHueSlider()

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.focus()
    preview(angleOf(event))
  }

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      preview(angleOf(event))
    }
  }

  const svgRef = useScrollToTurn()

  return (
    <div {...stylex.props(styles.dial)}>
      <svg
        {...slider}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => commit(hue)}
        ref={svgRef}
        viewBox="-100 -100 200 200"
        {...stylex.props(stylex.defaultMarker(), styles.ring)}
      >
        <Segments inner={72} outer={100} tick={15} />
        <Thumb turn={turn} />
      </svg>
      <div {...stylex.props(styles.core)}>{children}</div>
    </div>
  )
}

/** The ring's handle, with a focus ring that shows when the ring has focus. */
/** A scroll in progress: where it has got to, and the timer for its pause. */
type Scroll = { readonly at: Hue; readonly pause: number }

/**
 * Steps the hue 5° a notch while the mouse wheel scrolls, and commits once
 * the notches stop coming, so a scroll is one choice like a drag. Notches
 * can arrive faster than React renders, so each steps from the last.
 */
function useScrollToTurn() {
  const { commit, hue, preview } = useDial()
  const svgRef = useRef<SVGSVGElement>(null)
  const scrollRef = useRef<Scroll | null>(null)

  const settle = useEffectEvent((at: Hue) => {
    scrollRef.current = null
    commit(at)
  })

  const step = useEffectEvent((by: number) => {
    const at = hueAt((scrollRef.current?.at ?? hue) + by)

    clearTimeout(scrollRef.current?.pause)
    preview(at)
    scrollRef.current = {
      at,
      pause: window.setTimeout(() => settle(at), WHEEL_PAUSE_MS),
    }
  })

  // React's wheel listener is passive, so preventDefault needs a native one.
  useEffect(() => {
    const svg = svgRef.current

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      step(event.deltaY > 0 ? 5 : -5)
    }

    svg?.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      svg?.removeEventListener('wheel', onWheel)
      clearTimeout(scrollRef.current?.pause)
    }
  }, [])

  return svgRef
}

function Thumb({ turn }: { readonly turn: number }) {
  return (
    <g
      style={{ transform: `rotate(${turn}deg)` }}
      {...stylex.props(styles.thumb)}
    >
      <circle
        cx={0}
        cy={-86}
        r={16.5}
        {...stylex.props(styles.focusRing, styles.focusInk)}
      />
      <circle
        cx={0}
        cy={-86}
        r={14.5}
        {...stylex.props(styles.focusRing, styles.focusWhite)}
      />
      <circle cx={0} cy={-86} r={12.4} {...stylex.props(styles.thumbOutline)} />
      <circle cx={0} cy={-86} r={10.6} {...stylex.props(styles.thumbFill)} />
    </g>
  )
}

function angleOf(event: PointerEvent<SVGSVGElement>): Hue {
  const box = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - box.left - box.width / 2
  const y = event.clientY - box.top - box.height / 2

  return hueAt((Math.atan2(y, x) * 180) / Math.PI + 90)
}

const styles = stylex.create({
  core: { inset: '21.5%', position: 'absolute' },
  dial: { aspectRatio: 1, position: 'relative', width: '100%' },
  ring: {
    cursor: { default: 'grab', ':active': 'grabbing' },
    inset: 0,
    outline: 'none',
    overflow: 'visible',
    pointerEvents: 'none',
    position: 'absolute',
    touchAction: 'none',
  },
  thumb: {
    pointerEvents: 'none',
    transitionDuration: motion.quick,
    transitionProperty: 'transform',
    transitionTimingFunction: 'ease-out',
  },
  focusInk: { stroke: colors.ink },
  focusRing: {
    fill: 'none',
    opacity: { default: 0, [stylex.when.ancestor(':focus-visible')]: 1 },
    strokeWidth: 2,
  },
  focusWhite: { stroke: '#fff' },
  thumbOutline: { fill: colors.ink },
  thumbFill: {
    fill: colors.accent,
    stroke: '#fff',
    strokeWidth: 2,
  },
})
