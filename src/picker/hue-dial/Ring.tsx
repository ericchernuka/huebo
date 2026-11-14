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
import { followsPointer } from './motion'
import { Segments } from './Segments'

export function Ring({ children }: { readonly children: ReactNode }) {
  const { motion: state, send, turn } = useDial()
  const slider = useHueSlider()
  const svgRef = useScrollToTurn()

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    // A right click opens the context menu, and never comes back up.
    if (event.button !== 0) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    send({ by: 'pointer', hue: angleOf(event), type: 'aim' })
  }

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      send({ by: 'pointer', hue: angleOf(event), type: 'aim' })
    }
  }

  return (
    <div {...stylex.props(styles.dial)}>
      <svg
        {...slider}
        // Fires after pointerup and pointercancel alike.
        onLostPointerCapture={() => send({ type: 'letGo' })}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        ref={svgRef}
        viewBox="-100 -100 200 200"
        {...stylex.props(stylex.defaultMarker(), styles.ring)}
      >
        <Segments inner={72} outer={100} tick={15} />
        <Thumb moving={followsPointer(state)} turn={turn} />
      </svg>
      <div {...stylex.props(styles.core)}>{children}</div>
    </div>
  )
}

/** React's wheel listener is passive, so preventDefault needs a native one. */
function useScrollToTurn() {
  const { send } = useDial()
  const svgRef = useRef<SVGSVGElement>(null)

  const scroll = useEffectEvent((by: number) => send({ by, type: 'scroll' }))

  useEffect(() => {
    const svg = svgRef.current

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      scroll(event.deltaY > 0 ? 5 : -5)
    }

    svg?.addEventListener('wheel', onWheel, { passive: false })

    return () => svg?.removeEventListener('wheel', onWheel)
  }, [])

  return svgRef
}

type ThumbProps = { readonly moving: boolean; readonly turn: number }

function Thumb({ moving, turn }: ThumbProps) {
  return (
    <g
      style={{ transform: `rotate(${turn}deg)` }}
      {...stylex.props(styles.thumb, moving && styles.moving)}
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
  moving: { transitionDuration: '0s' },
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
