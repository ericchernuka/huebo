import * as stylex from '@stylexjs/stylex'
import { Toast } from '@base-ui/react/toast'
import { createContext, use, useState, type ReactNode } from 'react'
import { colors, easing, motion, radii } from '../../shared/tokens.stylex'
import { transitionClass } from '../../shared/transition'
import type { Color } from '../color'
import {
  readFormat,
  saveFormat,
  valuesOf,
  type Format,
  type Values,
} from './formats'

export type CardState = {
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

  const choose = (next: Format) => {
    setFormat(next)
    saveFormat(next)
  }

  return (
    <CardContext value={{ format, setFormat: choose, values }}>
      <Toast.Provider timeout={1800}>
        <section aria-label="Selected colour" {...stylex.props(styles.card)}>
          {children}
          <Toasts />
        </section>
      </Toast.Provider>
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

function Toasts() {
  const { toasts } = Toast.useToastManager()

  return (
    <Toast.Viewport>
      {toasts.map(toast => (
        <Toast.Positioner
          key={toast.id}
          toast={toast}
          {...stylex.props(styles.positioner)}
        >
          <Toast.Root
            className={transitionClass(
              styles.toast,
              styles.toastStarting,
              styles.toastEnding,
            )}
            toast={toast}
          >
            <Toast.Title {...stylex.props(styles.toastTitle)} />
          </Toast.Root>
        </Toast.Positioner>
      ))}
    </Toast.Viewport>
  )
}

const styles = stylex.create({
  card: { width: '100%' },
  positioner: { zIndex: 9 },
  toast: {
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    boxShadow: '0 8px 24px rgb(0 0 0 / 0.2)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    padding: '8px 16px',
    transformOrigin: 'var(--transform-origin)',
    transitionDuration: motion.pop,
    transitionProperty: 'opacity, transform',
    transitionTimingFunction: easing.pop,
    whiteSpace: 'nowrap',
  },
  toastEnding: {
    opacity: 0,
    transform: 'translateY(-6px) scale(0.96)',
    transitionTimingFunction: 'ease-in',
  },
  toastStarting: { opacity: 0, transform: 'translateY(8px) scale(0.6)' },
  toastTitle: { fontSize: 'inherit', margin: 0 },
})
