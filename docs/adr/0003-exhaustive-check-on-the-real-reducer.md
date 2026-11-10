# Check the real reducer exhaustively, in TypeScript

`pnpm verify` runs every order of up to 7 steps through the real `transition` and checks five promises about history and the shown hue. Where a commit takes the link is the real `nextLink` too. Only the code around them is modelled by hand: the store's landing loop in `dial-motion.ts`, the clocks, and TanStack's `commitLocation`.

## Considered options

- **TLA+ model of the machine.** This is the standard tool for order-of-events questions. It was rejected because a hand-written copy of `transition` drifts from the code, and it needs a Java toolchain that nobody here runs.
- **Property tests with random inputs.** These are cheaper, but they sample orders instead of covering them, and the bugs here hide in specific short orders.

## Consequences

The search depth is bounded, so a bug that needs more than 7 steps, or values outside the fixed alphabet, can pass. The parts that are modelled by hand still need re-reading when Picker or TanStack Router changes. `.agents/skills/verify-dial-motion/SKILL.md` records what's covered and the commit it was last checked against.
