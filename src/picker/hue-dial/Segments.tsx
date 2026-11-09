import * as stylex from '@stylexjs/stylex'
import { polar, segmentPath, STOPS } from './geometry'

export type SegmentsProps = {
  readonly inner: number
  readonly outer: number
  /** How far in from the outer edge the short notches reach. Every 45° the notch runs the full depth. */
  readonly tick: number
}

/** The 72 hard-edged hue segments with a notch between each, in SVG units around (0, 0). */
export function Segments({ inner, outer, tick }: SegmentsProps) {
  return STOPS.map(({ color, hue }, index) => {
    const long = index % 9 === 0
    const from = polar(hue - 2.5, long ? inner : outer - tick)
    const to = polar(hue - 2.5, outer)

    return (
      <g key={hue}>
        <path
          d={segmentPath(hue, inner, outer)}
          fill={color}
          {...stylex.props(styles.hit)}
        />
        <line
          stroke="rgb(255 255 255 / 0.6)"
          strokeWidth={long ? 2 : 1}
          vectorEffect="non-scaling-stroke"
          x1={from.x}
          x2={to.x}
          y1={from.y}
          y2={to.y}
        />
      </g>
    )
  })
}

const styles = stylex.create({
  hit: { pointerEvents: 'auto' },
})
