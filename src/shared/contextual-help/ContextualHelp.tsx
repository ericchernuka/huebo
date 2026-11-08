import { Popover } from '@base-ui/react/popover'
import * as stylex from '@stylexjs/stylex'
import { useRef, type ReactNode } from 'react'
import { shared } from '../styles'
import { colors, motion, radii } from '../tokens.stylex'

const VARIANTS = {
  help: { glyph: '?', label: 'Help' },
  info: { glyph: 'i', label: 'Information' },
} as const

type RootProps = {
  readonly children: ReactNode
  /** `help` explains how to use something; `info` adds background. */
  readonly variant?: keyof typeof VARIANTS
}

/**
 * A small round button that opens a popover of help, after React Spectrum's
 * ContextualHelp. Put a `Heading` and `Content` inside. It works by tap,
 * click and keyboard, unlike a hover tooltip.
 */
export function Root({ children, variant = 'help' }: RootProps) {
  // The popover renders here rather than in <body>, so it keeps the page's
  // theme variables and font.
  const host = useRef<HTMLSpanElement>(null)

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={VARIANTS[variant].label}
        {...stylex.props(shared.focusRing, styles.trigger)}
      >
        <span aria-hidden="true">{VARIANTS[variant].glyph}</span>
      </Popover.Trigger>
      <span ref={host} />
      <Popover.Portal container={host}>
        <Popover.Positioner sideOffset={8} {...stylex.props(styles.positioner)}>
          <Popover.Popup
            className={state =>
              stylex.props(
                styles.popup,
                state.transitionStatus === 'starting' && styles.hidden,
                state.transitionStatus === 'ending' && styles.hidden,
              ).className
            }
          >
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

export function Heading({ children }: { readonly children: ReactNode }) {
  return (
    <Popover.Title {...stylex.props(styles.heading)}>{children}</Popover.Title>
  )
}

export function Content({ children }: { readonly children: ReactNode }) {
  return (
    <Popover.Description render={<div />} {...stylex.props(styles.content)}>
      {children}
    </Popover.Description>
  )
}

const styles = stylex.create({
  content: { display: 'grid', fontSize: 15, gap: 8, lineHeight: 1.45 },
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
  positioner: { zIndex: 10 },
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
