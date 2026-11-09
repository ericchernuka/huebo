# Coding standards

How code in Huebo is written. The terms come from `GLOSSARY.md`, and the decisions behind them are in `docs/adr/`. Lint (`oxlint.config.ts`, with the custom rules in `tools/oxlint/`) and Fallow (`.fallowrc.jsonc`) enforce what they can. This file covers the rest.

## State

- **Derive, don't cache.** If a value can be computed from state that has an owner, compute it. The shown hue is `shownHue(motion, link)` in `src/picker/Picker.tsx`. It's never a second `useState` kept in step by an effect. A cache, a mirrored copy, or an effect that syncs two states means the design is wrong. Fix the owner instead.
- **Give every implicit state machine one owner and names.** When behaviour depends on "what's happening right now", such as a drag, a coast or a pending pause, write it as a discriminated union of named states with a pure `transition(state, event)` function. Timers and animation frames live in a small store that the component reads through `useSyncExternalStore`. `src/picker/hue-dial/motion.ts` and `dial-motion.ts` are the pattern.
- **The link is the only stored colour.** Every choice goes through the router. `localStorage` holds only the format.
- **Only choices write history.** A preview, whether a held key, a drag, scroll notches or a coast, never navigates. It commits once, when it finishes.
- **Parse at the edge.** Valibot schemas in `src/picker/color.ts` turn route params straight into a `Colour`. Code past the router never re-checks a hue.

## React

- The React Compiler is on. Don't write `useMemo`, `useCallback` or `memo`.
- Use `useEffectEvent` for callbacks that an effect calls but shouldn't re-run on.
- An effect only connects to something outside React, such as a DOM listener, history or the motion store. If it sets state from other state, derive the value instead.
- Build related parts as compound components (`HueDial.Root`, `HueDial.Ring`, …), sharing through context, not with boolean props. Use Base UI for popovers, toasts and radios.
- Base UI popups that portal need a container inside the themed tree, as in `Header.tsx`, or they lose the hue theme's variables.

## Styling

- Use StyleX only. `stylex.create` may read constants from the same file or from a `.stylex.ts` file, and nothing else. Importing a constant from an ordinary module breaks the compile.
- Don't use `defineConsts`, which races in dev. Use `defineVars` in `src/shared/tokens.stylex.ts`.
- Theme values (colours, radii, motion, easing) are tokens, not literals in components.

## Shape

- Keep modules deep: a small interface over real behaviour. If deleting a module would only move its code into its one caller, it shouldn't exist.
- Lint sets these limits: 60 lines per function, 300 lines per file, complexity 10, 3 parameters, depth 3 and 20 statements. When you hit one, split the code along a real seam, and don't silence the rule.
- A type assertion needs a `SAFETY:` comment that says why it holds. Prefer a type that doesn't need one.
- Code-based routes live in `src/router/`.

## Names and comments

- Let names say what a comment would. Put units in names (`SCROLL_PAUSE_MS`, `RADIUS_PX`) and name layout numbers, don't leave them bare.
- Write a comment only for a constraint we can't change: a browser quirk, a library limit, or a "why" that the code can't show.
- Use the glossary's words in code, tests and commits, and avoid the words it lists under _Avoid_.

## Tests

- Name tests `given …, when …, then …`, in the glossary's words.
- Unit tests (`*.test.ts`) run in Node, for pure modules. Browser tests (`*.test.tsx`) run in Chromium through the real router, using `openAt` in `src/test/app.tsx`. Don't mock modules (lint bans it).
- A new test must fail on the code before the change. If it would pass anyway, it proves nothing.
- Assert on what a person can observe: the URL, `history.length`, roles and names, and element identity when the claim is "the same one, not a new one".

## Proof

- `pnpm check` runs format, types, lint, tests, build and Fallow. It must pass before a push.
- `pnpm verify` checks the dial's motion against every order of inputs. Run it after touching motion, the dial's events or the commit wiring. See `.claude/skills/verify-dial-motion/`.
- Before saying a UI change works, drive it in a real browser with `.claude/skills/verify-huebo/`.

## Git

- Branch names start with `ec/`.
- Make small commits, each a sane group, with a plain message that says what changed and why.
- Never run a bare `git stash`, because worktrees share the stash.
