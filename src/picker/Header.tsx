import { Popover } from '@base-ui/react/popover'
import * as stylex from '@stylexjs/stylex'
import { useRef } from 'react'
import { shared } from '../shared/styles'
import { colors, motion, radii } from '../shared/tokens.stylex'
import { transitionClass } from '../shared/transition'
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
  const themedContainer = useRef<HTMLSpanElement>(null)

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label="Help"
        {...stylex.props(shared.focusRing, styles.trigger)}
      >
        <span aria-hidden="true">?</span>
      </Popover.Trigger>
      <span ref={themedContainer} />
      <Popover.Portal container={themedContainer}>
        <Popover.Positioner sideOffset={8} {...stylex.props(styles.positioner)}>
          <Popover.Popup
            className={transitionClass(styles.popup, styles.hidden)}
          >
            <Popover.Title {...stylex.props(styles.heading)}>
              Picking a colour
            </Popover.Title>
            <Popover.Description
              render={<div />}
              {...stylex.props(styles.content)}
            >
              <p {...stylex.props(styles.text)}>
                Turn the dial to choose a hue, then pick one of its 64 steps.
                Copy it as HSB, RGB or Hex.
              </p>
              <p {...stylex.props(styles.text)}>
                On the dial, the arrow keys step 5° and Shift steps 45°. In the
                grid, the arrow keys move, Enter picks and Escape clears.
              </p>
              <p {...stylex.props(styles.text, styles.credit)}>
                Based on a design by{' '}
                <a
                  href="https://lmnt.me"
                  rel="noreferrer"
                  target="_blank"
                  {...stylex.props(shared.focusRing, styles.link)}
                >
                  Louie Mantia
                </a>
                .
              </p>
            </Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

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
  hidden: { opacity: 0, transform: 'scale(0.96)' },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 16,
    boxShadow: '0 12px 32px rgb(0 0 0 / 0.18)',
    color: colors.ink,
    maxWidth: 'min(320px, calc(100vw - 24px))',
    outline: 'none',
    padding: '14px 16px 16px',
    textAlign: 'start',
    transformOrigin: 'var(--transform-origin)',
    transitionDuration: motion.quick,
    transitionProperty: 'opacity, transform',
  },
  link: {
    borderRadius: 4,
    color: colors.ink,
    fontWeight: 700,
    textDecorationColor: colors.accent,
    textDecorationThickness: 2,
    textUnderlineOffset: 3,
  },
  positioner: { zIndex: 10 },
  text: { margin: 0 },
  trigger: {
    alignItems: 'center',
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
