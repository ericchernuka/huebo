import * as stylex from '@stylexjs/stylex'
import type { PointerEvent } from 'react'
import { colors, motion } from '../../shared/tokens.stylex'
import { polar } from './geometry'
import { useDial, useHueSlider } from './HueDialRoot'
import { freeTurn } from './motion'
import { Segments } from './Segments'

const RADIUS_PX = 520
const BAND_PX = 74

const TOP_INSET_PX = 26

/** Pointer downs this close to a side edge belong to the system's back swipe. */
const EDGE_PX = 24

const DEGREES_PER_RADIAN = 180 / Math.PI

/** `style` can pad its bottom (for a safe area, say): the band keeps drawing into the padding. */
export function Wheel({ style }: { readonly style?: stylex.StyleXStyles }) {
  const { motion: state, send, turn } = useDial()
  const slider = useHueSlider()
  const free = freeTurn(state)
  const rotation = free ?? turn

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)

    const fromEdge =
      event.clientX < EDGE_PX || event.clientX > window.innerWidth - EDGE_PX

    send({
      ...pointerOf(event),
      fromEdge,
      radius: RADIUS_PX,
      turn,
      type: 'press',
    })
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
        height={RADIUS_PX * 2}
        viewBox={`${-RADIUS_PX} ${-RADIUS_PX} ${RADIUS_PX * 2} ${RADIUS_PX * 2}`}
        width={RADIUS_PX * 2}
        {...stylex.props(styles.svg)}
      >
        <g
          style={{ transform: `rotate(${-rotation}deg)` }}
          {...stylex.props(styles.rotor, free !== null && styles.moving)}
        >
          <Segments inner={RADIUS_PX - BAND_PX} outer={RADIUS_PX} tick={18} />
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

function tapAngle(event: PointerEvent<HTMLElement>): number {
  const box = event.currentTarget.getBoundingClientRect()
  const centreX = box.left + box.width / 2
  const centreY = box.top + TOP_INSET_PX + RADIUS_PX

  return (
    Math.atan2(event.clientX - centreX, centreY - event.clientY) *
    DEGREES_PER_RADIAN
  )
}

function Labels() {
  return Array.from({ length: 8 }, (_, index) => {
    const angle = index * 45
    const { x, y } = polar(angle, RADIUS_PX - BAND_PX - 16)

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
    marginLeft: -RADIUS_PX,
    overflow: 'visible',
    pointerEvents: 'none',
    position: 'absolute',
    top: TOP_INSET_PX,
  },
  wheel: {
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
