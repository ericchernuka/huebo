import * as stylex from '@stylexjs/stylex'
import { useId, type FocusEvent, type ToggleEvent } from 'react'
import { shared } from '../shared/styles'
import { colors, motion, radii } from '../shared/tokens.stylex'
import type { Color } from './color'
import { Wordmark } from './Wordmark'

export function Header({ color }: { readonly color: Color }) {
  return (
    <>
      <Wordmark color={color} />
      <Help />
    </>
  )
}

function Help() {
  const popup = useId()
  const heading = useId()
  const description = useId()

  return (
    <>
      <button
        aria-controls={popup}
        aria-haspopup="dialog"
        aria-label="Help"
        popoverTarget={popup}
        type="button"
        {...stylex.props(shared.focusRing, styles.trigger)}
      >
        <span aria-hidden="true">?</span>
      </button>
      <dialog
        aria-describedby={description}
        aria-labelledby={heading}
        id={popup}
        onToggle={moveFocus}
        popover="auto"
        {...stylex.props(styles.popup, styles.popupStarting)}
      >
        <h2 id={heading} {...stylex.props(styles.heading)}>
          Picking a colour
        </h2>
        <div id={description} {...stylex.props(styles.content)}>
          <p {...stylex.props(styles.text)}>
            Turn the dial to choose a hue, then pick one of its 64 steps. Copy
            it as HSB, RGB or Hex.
          </p>
          <p {...stylex.props(styles.text)}>
            On the dial, the arrow keys step 5° and Shift steps 45°. In the
            grid, the arrow keys move, Enter picks and Escape clears.
          </p>
          <p {...stylex.props(styles.text, styles.credit)}>
            Based on a design by{' '}
            <a
              href="https://lmnt.me"
              onBlur={closeOnFocusOut}
              rel="noreferrer"
              target="_blank"
              {...stylex.props(shared.focusRing, styles.link)}
            >
              Louie Mantia
            </a>
            .
          </p>
        </div>
      </dialog>
    </>
  )
}

// The browser hands focus back to Help on Escape, but not after a click
// outside, which leaves it on the page, so that case puts it back on Help.
function moveFocus(event: ToggleEvent<HTMLDialogElement>) {
  const help = event.currentTarget

  if (event.newState === 'open') {
    help.querySelector('a')?.focus({ preventScroll: true })
  } else if (document.activeElement === document.body) {
    document
      .querySelector<HTMLElement>(`[popovertarget="${help.id}"]`)
      ?.focus({ preventScroll: true })
  }
}

function closeOnFocusOut(event: FocusEvent<HTMLAnchorElement>) {
  const next = event.relatedTarget
  const help = event.currentTarget.closest('dialog')

  if (
    help !== null &&
    next instanceof Node &&
    !help.contains(next) &&
    !(next instanceof HTMLButtonElement && next.popoverTargetElement === help)
  ) {
    help.hidePopover()
  }
}

const POPUP_GAP_PX = 8
const POPUP_EDGE_PX = 5

const styles = stylex.create({
  content: { display: 'grid', fontSize: 15, gap: 8, lineHeight: 1.45 },
  credit: {
    borderTopColor: 'rgb(0 0 0 / 0.08)',
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    color: colors.inkMuted,
    fontSize: 13,
    marginTop: 4,
    paddingTop: 10,
  },
  heading: { fontSize: 17, fontWeight: 800, margin: '0 0 6px' },
  // A popover sits in the top layer but stays in the themed tree, so it keeps
  // the hue's variables without a portal.
  popup: {
    backgroundColor: '#fff',
    borderStyle: 'none',
    borderRadius: 16,
    boxShadow: '0 12px 32px rgb(0 0 0 / 0.18)',
    color: colors.ink,
    inset: 'auto',
    margin: `${POPUP_GAP_PX}px ${POPUP_EDGE_PX}px`,
    maxWidth: 'min(320px, calc(100vw - 24px))',
    opacity: { default: 0, ':popover-open': 1 },
    outline: 'none',
    padding: '14px 16px 16px',
    positionAnchor: '--help',
    positionArea: 'bottom',
    positionTryFallbacks: 'flip-block',
    textAlign: 'start',
    transform: { default: 'scale(0.96)', ':popover-open': 'none' },
    transformOrigin: 'top',
    transitionBehavior: 'allow-discrete',
    transitionDuration: motion.quick,
    transitionProperty: 'opacity, transform, display, overlay',
  },
  popupStarting: {
    '@starting-style': { opacity: 0, transform: 'scale(0.96)' },
  },
  link: {
    borderRadius: 4,
    color: colors.ink,
    fontWeight: 700,
    textDecorationColor: colors.accent,
    textDecorationThickness: 2,
    textUnderlineOffset: 3,
  },
  text: { margin: 0 },
  trigger: {
    alignItems: 'center',
    anchorName: '--help',
    backgroundColor: { default: colors.panel, ':hover': '#fff' },
    borderColor: colors.inkMuted,
    borderRadius: radii.pill,
    borderStyle: 'solid',
    borderWidth: 1.5,
    cursor: 'pointer',
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: 15,
    fontWeight: 800,
    height: 28,
    justifyContent: 'center',
    padding: 0,
    width: 28,
  },
})
