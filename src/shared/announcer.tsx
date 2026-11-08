import * as stylex from '@stylexjs/stylex'
import { createContext, use, useState, type ReactNode } from 'react'

const AnnounceContext = createContext<(message: string) => void>(
  () => undefined,
)

/**
 * One polite live region for the subtree. Each message is a new node, so
 * screen readers read it even when it repeats the last one.
 */
export function Announcer({ children }: { readonly children: ReactNode }) {
  const [message, setMessage] = useState({ id: 0, text: '' })

  const announce = (text: string) =>
    setMessage(previous => ({ id: previous.id + 1, text }))

  return (
    <AnnounceContext value={announce}>
      {children}
      <div aria-live="polite" {...stylex.props(styles.visuallyHidden)}>
        <span key={message.id}>{message.text}</span>
      </div>
    </AnnounceContext>
  )
}

/** Returns a function that reads a message to screen reader users. */
export function useAnnounce(): (message: string) => void {
  return use(AnnounceContext)
}

const styles = stylex.create({
  visuallyHidden: {
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    whiteSpace: 'nowrap',
    width: 1,
  },
})
