import { hsbToHex } from '../../shared/color'
import { hueAt, type Hue } from '../color'

const NAMES = [
  'red',
  'orange',
  'yellow',
  'lime',
  'green',
  'teal',
  'cyan',
  'azure',
  'blue',
  'violet',
  'magenta',
  'rose',
] as const

/** What a screen reader says for a hue, for example "200 degrees, azure". */
export function describeHue(hue: Hue): string {
  return `${hue} degrees, ${NAMES[Math.round(hue / 30) % NAMES.length] ?? 'red'}`
}

export const STOPS = Array.from({ length: 72 }, (_, index) => {
  const hue = hueAt(index * 5)

  return { color: hsbToHex(hue, 85, 92), hue }
})

/** A point at `angle` degrees clockwise from the top, `radius` from the centre. */
export function polar(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180

  return { x: Math.sin(radians) * radius, y: -Math.cos(radians) * radius }
}

/** The SVG path of the ring segment centred on `hue`, between two radii. */
export function segmentPath(hue: Hue, inner: number, outer: number): string {
  const [a, b, c, d] = [
    polar(hue - 2.5, outer),
    polar(hue + 2.5, outer),
    polar(hue + 2.5, inner),
    polar(hue - 2.5, inner),
  ]

  return `M${a.x} ${a.y}A${outer} ${outer} 0 0 1 ${b.x} ${b.y}L${c.x} ${c.y}A${inner} ${inner} 0 0 0 ${d.x} ${d.y}Z`
}

/** The signed shortest way round from one hue to another, in -180 to 175. */
export function shortestTurn(from: Hue, to: Hue): number {
  return ((to - from + 540) % 360) - 180
}
