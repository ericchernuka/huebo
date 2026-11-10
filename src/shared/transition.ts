import * as stylex from '@stylexjs/stylex'

export type TransitionState = {
  readonly transitionStatus: 'starting' | 'ending' | 'idle' | undefined
}

/**
 * A Base UI `className` function for a part that animates in and out: the
 * `base` style, plus `from` while it enters and `to` while it leaves.
 */
export function transitionClass(
  base: stylex.StyleXStyles,
  from: stylex.StyleXStyles,
  to: stylex.StyleXStyles = from,
) {
  return ({ transitionStatus }: TransitionState) =>
    stylex.props(
      base,
      transitionStatus === 'starting' && from,
      transitionStatus === 'ending' && to,
    ).className
}
