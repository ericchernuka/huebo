import * as stylex from '@stylexjs/stylex'
import type { PointerEvent, ReactNode } from 'react'
import { colors, motion } from '../../shared/tokens.stylex'
import { hueAt, type Hue } from '../color'
import { useDial, useHueSlider } from './HueDialRoot'
import { Segments } from './Segments'

/**
 * The full hue ring, with `children` (the grid) in its middle. Click or drag
 * the ring to set the angle; the mouse wheel steps 5°. It's a square that
 * fills its container's width.
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

  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    commit(hueAt(hue + (event.deltaY > 0 ? 5 : -5)))
  }

  // React's wheel listener is passive, so the step and preventDefault go on
  // a native listener instead.
  const stepOnWheel = (svg: SVGSVGElement) => {
    svg.addEventListener('wheel', onWheel, { passive: false })

    return () => svg.removeEventListener('wheel', onWheel)
  }

  return (
    <div {...stylex.props(styles.dial)}>
      <svg
        {...slider}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => commit(hue)}
        ref={stepOnWheel}
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
