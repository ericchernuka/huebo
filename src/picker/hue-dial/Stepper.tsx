import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { shared } from '../../shared/styles'
import { colors, radii } from '../../shared/tokens.stylex'
import { useDial } from './HueDialRoot'

export type PartProps = { readonly style?: stylex.StyleXStyles }

/**
 * Groups the − and + buttons that step the hue 5° and wrap at 355°/0°: the
 * alternative to dragging (WCAG 2.5.7), shown at every size.
 */
export function Stepper({
  children,
  style,
}: PartProps & { readonly children: ReactNode }) {
  return (
    <fieldset aria-label="Hue" {...stylex.props(styles.stepper, style)}>
      {children}
    </fieldset>
  )
}

export function Decrement({ style }: PartProps) {
  return <StepButton by={-5} label="Decrease" style={style} symbol="−" />
}

export function Increment({ style }: PartProps) {
  return <StepButton by={5} label="Increase" style={style} symbol="+" />
}

/** The hue in degrees. Hidden from screen readers, which hear the buttons' announcements. */
export function Degrees({ style }: PartProps) {
  const { hue } = useDial()

  return (
    <span aria-hidden="true" {...stylex.props(styles.degrees, style)}>
      {hue}°
    </span>
  )
}

type StepButtonProps = PartProps & {
  readonly by: number
  readonly label: string
  readonly symbol: string
}

function StepButton({ by, label, style, symbol }: StepButtonProps) {
  const { send } = useDial()

  return (
    <button
      aria-label={`${label} hue by 5 degrees`}
      onClick={() => send({ by, type: 'step' })}
      type="button"
      {...stylex.props(shared.focusRing, styles.button, style)}
    >
      {symbol}
    </button>
  )
}

const styles = stylex.create({
  button: {
    backgroundColor: { default: 'transparent', ':hover': 'rgb(0 0 0 / 0.06)' },
    borderRadius: '50%',
    borderWidth: 0,
    cursor: 'pointer',
    fontSize: 22,
    height: 44,
    width: 44,
  },
  degrees: {
    fontSize: 20,
    fontWeight: 800,
    minWidth: 64,
    textAlign: 'center',
  },
  stepper: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderRadius: radii.pill,
    borderWidth: 0,
    display: 'flex',
    gap: 6,
    justifyContent: 'space-between',
    margin: 0,
    minWidth: 0,
    padding: 4,
  },
})
