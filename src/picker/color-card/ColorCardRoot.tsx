import * as stylex from '@stylexjs/stylex'
import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { useAnnounce } from '../../shared/announcer'
import { colors, easing, motion, radii } from '../../shared/tokens.stylex'
import { useFormatTool } from '../agent/tools'
import type { Color } from '../color'
import { valuesOf, type Format, type Values } from '../formats'
import { createConfirmation, type Confirmation } from './confirmation'
import { readFormat, saveFormat } from './stored-format'

const CONFIRMATION_SHOWN_MS = 1800

export type CardState = {
  readonly confirm: (text: string, copied: boolean) => void
  readonly confirmation: Confirmation | null
  readonly format: Format
  readonly setFormat: (format: Format) => void
  readonly values: Values | null
}

const CardContext = createContext<CardState | null>(null)

export type RootProps = {
  readonly children: ReactNode
  readonly color: Color
}

export function Root({ children, color }: RootProps) {
  const [format, setFormat] = useState(readFormat)
  const values = valuesOf(color)
  const announce = useAnnounce()

  const [confirmations] = useState(() =>
    createConfirmation(CONFIRMATION_SHOWN_MS),
  )

  const confirmation = useSyncExternalStore(
    confirmations.subscribe,
    confirmations.get,
  )

  const confirm = (text: string, copied: boolean) => {
    confirmations.show(text, copied)
    announce(text)
  }

  const choose = (next: Format) => {
    setFormat(next)
    saveFormat(next)
  }

  useFormatTool(choose, values?.text ?? null)

  return (
    <CardContext
      value={{ confirm, confirmation, format, setFormat: choose, values }}
    >
      <section aria-label="Selected colour" {...stylex.props(styles.card)}>
        {children}
        <ConfirmationPopover confirmation={confirmation} />
      </section>
    </CardContext>
  )
}

export function useCard(): CardState {
  const card = use(CardContext)

  if (!card) {
    throw new Error('ColorCard parts must be inside <ColorCard.Root>.')
  }

  return card
}

/**
 * Screen readers hear the confirmation from the announcer. A live region that
 * has only just appeared isn't read, so this copy is hidden to avoid saying it
 * twice.
 */
function ConfirmationPopover({
  confirmation,
}: {
  readonly confirmation: Confirmation | null
}) {
  const popover = useRef<HTMLDivElement>(null)
  const shown = confirmation?.shown ?? false

  useEffect(() => {
    popover.current?.togglePopover(shown)
  }, [shown])

  return (
    <div
      aria-hidden="true"
      popover="manual"
      ref={popover}
      {...stylex.props(styles.toast, styles.toastStarting)}
    >
      {confirmation?.text}
    </div>
  )
}

const CONFIRMATION_GAP_PX = 10
const CONFIRMATION_EDGE_PX = 5

const styles = stylex.create({
  card: { width: '100%' },
  toast: {
    backgroundColor: colors.ink,
    borderStyle: 'none',
    borderRadius: radii.pill,
    boxShadow: '0 8px 24px rgb(0 0 0 / 0.2)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    inset: 'auto',
    margin: `0 ${CONFIRMATION_EDGE_PX}px ${CONFIRMATION_GAP_PX}px`,
    opacity: { default: 0, ':popover-open': 1 },
    padding: '8px 16px',
    positionAnchor: '--copy',
    positionArea: 'top',
    transform: {
      default: 'translateY(-6px) scale(0.96)',
      ':popover-open': 'none',
    },
    transformOrigin: `50% calc(100% + ${CONFIRMATION_GAP_PX}px)`,
    transitionBehavior: 'allow-discrete',
    transitionDuration: motion.pop,
    transitionProperty: 'opacity, transform, display, overlay',
    transitionTimingFunction: {
      default: 'ease-in',
      ':popover-open': easing.pop,
    },
    whiteSpace: 'nowrap',
  },
  toastStarting: {
    '@starting-style': { opacity: 0, transform: 'translateY(8px) scale(0.6)' },
  },
})
