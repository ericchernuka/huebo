import * as stylex from '@stylexjs/stylex'
import type { PointerEvent } from 'react'
import { colors, motion } from '../../shared/tokens.stylex'
import { polar } from './geometry'
import { useDial, useHueSlider } from './HueDialRoot'
import { freeTurn } from './motion'
import { Segments } from './Segments'

/** The wheel's radius in px. One 5° step is about 45px of finger travel. */
const RADIUS = 520
const BAND = 74

/** How far below the top of the wheel area the top of the wheel sits. */
const TOP = 26

/** Pointer downs this close to a side edge belong to the system's back swipe. */
const EDGE = 24

const DEGREES_PER_RADIAN = 180 / Math.PI

/**
 * The phone's hue control: the top edge of a big wheel docked at the bottom
 * of the screen, turning under a fixed pin. Drag it sideways, flick it to
 * coast, or tap a segment to jump there. `style` can pad its bottom (for a
 * safe area, say): the band keeps drawing into the padding.
 */
export function Wheel({ style }: { readonly style?: stylex.StyleXStyles }) {
  const { motion: state, send, turn } = useDial()
  const slider = useHueSlider()
  const free = freeTurn(state)
  const rotation = free ?? turn

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)

    const fromEdge =
      event.clientX < EDGE || event.clientX > window.innerWidth - EDGE

    send({ ...pointerOf(event), fromEdge, radius: RADIUS, turn, type: 'press' })
  }

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

    send({
      ...pointerOf(event),
      reduced,
      tapAngle: tapAngle(event),
      type: 'release',
    })
  }

  return (
    <div
      {...slider}
      onPointerCancel={event =>
        send({ pointerId: event.pointerId, type: 'cancel' })
      }
      onPointerDown={onPointerDown}
      onPointerMove={event => send({ ...pointerOf(event), type: 'move' })}
      onPointerUp={onPointerUp}
      {...stylex.props(stylex.defaultMarker(), styles.wheel, style)}
    >
      <svg
        aria-hidden="true"
        height={RADIUS * 2}
        viewBox={`${-RADIUS} ${-RADIUS} ${RADIUS * 2} ${RADIUS * 2}`}
        width={RADIUS * 2}
        {...stylex.props(styles.svg)}
      >
        <g
          style={{ transform: `rotate(${-rotation}deg)` }}
          {...stylex.props(styles.rotor, free !== null && styles.moving)}
        >
          <Segments inner={RADIUS - BAND} outer={RADIUS} tick={18} />
          <Labels />
        </g>
      </svg>
      <span {...stylex.props(styles.pin)} />
    </div>
  )
}

function pointerOf(event: PointerEvent<HTMLElement>) {
  return { pointerId: event.pointerId, time: event.timeStamp, x: event.clientX }
}

/** The angle from the pin to a tap, measured at the wheel's centre. */
function tapAngle(event: PointerEvent<HTMLElement>): number {
  const box = event.currentTarget.getBoundingClientRect()
  const centreX = box.left + box.width / 2
  const centreY = box.top + TOP + RADIUS

  return (
    Math.atan2(event.clientX - centreX, centreY - event.clientY) *
    DEGREES_PER_RADIAN
  )
}

/** Hue labels every 45°, following the curve of the wheel. */
function Labels() {
  return Array.from({ length: 8 }, (_, index) => {
    const angle = index * 45
    const { x, y } = polar(angle, RADIUS - BAND - 16)

    return (
      <text
        key={angle}
        textAnchor="middle"
        transform={`rotate(${angle} ${x} ${y})`}
        x={x}
        y={y + 5}
        {...stylex.props(styles.label)}
      >
        {angle}°
      </text>
    )
  })
}

const styles = stylex.create({
  label: { fill: colors.ink, fontSize: 14, fontWeight: 600 },
  moving: { transitionDuration: '0s' },
  pin: {
    backgroundColor: colors.accent,
    borderColor: '#fff',
    borderRadius: '50%',
    borderStyle: 'solid',
    borderWidth: 5,
    boxShadow: {
      default: `0 0 0 2px ${colors.ink}, 0 6px 16px rgb(0 0 0 / 0.25)`,
      [stylex.when.ancestor(':focus-visible')]:
        `0 0 0 2px ${colors.ink}, 0 0 0 6px #fff, 0 0 0 9px ${colors.ink}`,
    },
    height: 58,
    left: '50%',
    marginLeft: -29,
    pointerEvents: 'none',
    position: 'absolute',
    top: 14,
    width: 58,
  },
  rotor: {
    transitionDuration: motion.quick,
    transitionProperty: 'transform',
    transitionTimingFunction: 'ease-out',
  },
  svg: {
    left: '50%',
    marginLeft: -RADIUS,
    overflow: 'visible',
    pointerEvents: 'none',
    position: 'absolute',
    top: TOP,
  },
  wheel: {
    // Padding adds to the 150px rather than eating into it.
    boxSizing: 'content-box',
    cursor: 'grab',
    display: 'block',
    height: 150,
    outline: 'none',
    overflow: 'hidden',
    overscrollBehavior: 'contain',
    position: 'relative',
    touchAction: 'pan-y',
    userSelect: 'none',
  },
})
