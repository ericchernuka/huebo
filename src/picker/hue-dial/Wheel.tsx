import * as stylex from '@stylexjs/stylex'
import { colors, motion } from '../../shared/tokens.stylex'
import { polar } from './geometry'
import { useHueSlider } from './HueDialRoot'
import { Segments } from './Segments'
import { useWheelGesture } from './wheel-gesture'

/** The wheel's radius in px. One 5° step is about 45px of finger travel. */
const RADIUS = 520
const BAND = 74

/** How far below the top of the wheel area the top of the wheel sits. */
const TOP = 26

/**
 * The phone's hue control: the top edge of a big wheel docked at the bottom
 * of the screen, turning under a fixed pin. `style` can pad its bottom (for
 * a safe area, say): the band keeps drawing into the padding.
 */
export function Wheel({ style }: { readonly style?: stylex.StyleXStyles }) {
  const slider = useHueSlider()

  const { handlers, moving, rotation } = useWheelGesture({
    radius: RADIUS,
    top: TOP,
  })

  return (
    <div
      {...slider}
      {...handlers}
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
          {...stylex.props(styles.rotor, moving && styles.moving)}
        >
          <Segments inner={RADIUS - BAND} outer={RADIUS} tick={18} />
          <Labels />
        </g>
      </svg>
      <span {...stylex.props(styles.pin)} />
    </div>
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
