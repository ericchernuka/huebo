import * as stylex from '@stylexjs/stylex'
import { shared } from '../../shared/styles'
import { colors, motion, radii } from '../../shared/tokens.stylex'
import { useCard } from './ColorCardRoot'

const draw = stylex.keyframes({
  from: { strokeDashoffset: 16 },
  to: { strokeDashoffset: 0 },
})

export function Copy() {
  const { confirm, confirmation, format, values } = useCard()
  const value = values?.text[format]
  const copied = confirmation?.shown === true && confirmation.copied

  const copy = async (text: string) => {
    const ok = await writeToClipboard(text)

    confirm(ok ? `Copied ${format} ${text}` : `Couldn't copy ${format}`, ok)
  }

  return (
    <button
      disabled={value === undefined}
      onClick={() => value !== undefined && void copy(value)}
      type="button"
      {...stylex.props(shared.focusRing, styles.copy, copied && styles.copied)}
    >
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

/**
 * Whether the text reached the clipboard. Outside a secure context, such as a
 * phone opening a dev server by its LAN address, there is no clipboard at all.
 */
async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)

    return true
  } catch {
    return false
  }
}

const styles = stylex.create({
  copied: { backgroundColor: colors.ink, color: '#fff' },
  copy: {
    alignItems: 'center',
    anchorName: '--copy',
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
