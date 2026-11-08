import * as stylex from '@stylexjs/stylex'
import { Toast } from '@base-ui/react/toast'
import { shared } from '../../shared/styles'
import { colors, motion, radii } from '../../shared/tokens.stylex'
import { useCard } from './ColorCardRoot'

const draw = stylex.keyframes({
  from: { strokeDashoffset: 16 },
  to: { strokeDashoffset: 0 },
})

/**
 * Copies the value in the chosen format. A copy squeezes the button, ticks
 * it, and pops a confirmation out of it.
 */
export function Copy() {
  const { format, values } = useCard()
  const toasts = Toast.useToastManager()
  const value = values?.text[format]

  // The button shows its tick for as long as the confirmation is up.
  const copied = toasts.toasts.some(
    toast => toast.transitionStatus !== 'ending',
  )

  const copy = async (text: string, button: HTMLButtonElement) => {
    const title = await navigator.clipboard.writeText(text).then(
      () => `Copied ${format} ${text}`,
      () => `Couldn't copy ${format}`,
    )

    toasts.close()
    toasts.add({
      positionerProps: { anchor: button, side: 'top', sideOffset: 10 },
      title,
    })
  }

  return (
    <button
      disabled={value === undefined}
      onClick={event =>
        value !== undefined && void copy(value, event.currentTarget)
      }
      type="button"
      {...stylex.props(shared.focusRing, styles.copy, copied && styles.copied)}
    >
      {/* The label keeps its space while the tick shows, so the button never changes size. */}
      <span {...stylex.props(copied && styles.hiddenLabel)}>
        {value === undefined ? 'Copy' : `Copy ${format}`}
      </span>
      {copied && (
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          {...stylex.props(styles.tick)}
        >
          <path d="M3 8.5l3.2 3L13 4.5" />
        </svg>
      )}
    </button>
  )
}

const styles = stylex.create({
  copied: { backgroundColor: colors.ink, color: '#fff' },
  copy: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: colors.ink,
    borderRadius: radii.pill,
    borderStyle: 'solid',
    borderWidth: 2,
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    display: 'inline-flex',
    flexShrink: 0,
    fontWeight: 600,
    justifyContent: 'center',
    minHeight: 44,
    opacity: { default: 1, ':disabled': 0.45 },
    paddingInline: 20,
    position: 'relative',
    transform: { default: null, ':active:enabled': 'scale(0.94)' },
    transitionDuration: motion.quick,
    transitionProperty: 'transform, background-color, color',
  },
  // Opacity rather than visibility, so the button keeps its accessible name.
  hiddenLabel: { opacity: 0 },
  tick: {
    animationDuration: motion.pop,
    animationFillMode: 'both',
    animationName: draw,
    animationTimingFunction: 'ease-out',
    fill: 'none',
    height: 20,
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
    position: 'absolute',
    stroke: 'currentColor',
    strokeDasharray: 16,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2.25,
    top: '50%',
    width: 20,
  },
})
