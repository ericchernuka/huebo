# Huebo dial redesign: implementation handoff

You're rebuilding Huebo around a new design called "the dial". It has already been designed and prototyped; this document is the spec. Your job is to ship it **working correctly, with the smallest amount of code**, on a new stack.

**Load `/codebase-design` before designing anything and keep it in mind throughout.** Every module should be deep with a simple interface. Whenever something feels awkward, fix the architecture first so impossible states can't be represented, rather than adding guards.

## Reference material (read first)

- `b2-dial.html` is the approved interactive prototype, written in vanilla JS. Open it in a real browser at 390, 820 and 1280px wide and try it. **It's the source of truth for look, feel and behaviour**, but not for code structure: it's a throwaway mockup.
- `b2-board.html` shows the prototype at all three sizes side by side, with captions.
- `b2-desktop.png`, `b2-tablet.png`, `b2-phone.png` and `b2-board.png` are screenshots.
- `a-specimen.html`, `b-dial.html` and `c-workbench.html` are the earlier explorations. **They were rejected** and are for context only. The user liked B's card and the hue-tinted background, found C boring, and didn't want C's palette feature.

All of these sit next to this file in the scratchpad directory. In your first commit, copy `HANDOFF.md`, `b2-dial.html` and `b2-board.html` into `docs/design/`, so they survive after the scratchpad is cleaned up.

## What Huebo is

Huebo is a small HSB colour picker, and the URL holds all of its state.

- **Hue**: 0–355° in 5° steps, which gives 72 stops.
- **Grid**: a fixed 8×8 of saturation × brightness, using the steps `[12, 25, 38, 50, 62, 75, 88, 100]`. This stepping is the core idea, and it must be kept exactly.
- You pick a square and copy its HSB, RGB or Hex value.
- **Shareable URLs**: `/{hue}` or `/{hue}/{saturation}/{brightness}`, for example `/60` or `/200/62/75`.

### Backwards compatibility (the only hard constraints)

1. **The URL format must stay the same.** `/:hue` and `/:hue/:saturation/:brightness`, where hue is a multiple of 5 from 0 to 355 and saturation and brightness are each one of the eight steps. Any other path redirects to `/60`, as it does today in `src/routes.js` and `src/components/App.jsx`.
2. **Shared links must show the same colour as today.** The HSB to RGB to Hex conversion must give byte-identical output to the current `src/utils/color_utils.js` for all 72 × 64 combinations. That's a golden test, and it's a good candidate for a fast node-environment test.
3. Clicking the selected square deselects it and goes back to `/{hue}`, as it does today.

Everything else can change, including the components, the tests and the dependencies. Keep the existing GA4 analytics behaviour from `src/analytics/`. It was migrated deliberately in PR #9, does nothing when `VITE_GOOGLE_ANALYTICS_ID` is unset, and tracks the route template as the page with the colour values as params. Keep the existing service worker (`vite-plugin-pwa`, `/service-worker.js`) unless it gets in the way. If you remove it, ship a self-destroying worker so returning visitors aren't stuck on a cached copy of the old app.

## UX spec

### Layouts

The layout depends on the window width, using **CSS media queries rather than JavaScript**. Only one hue control is ever rendered visibly; the other is `display: none`, which also takes it out of the accessibility tree.

| Width | Layout |
|---|---|
| ≥ 960px | Two columns. Left: the full **ring** dial (`--d: min(88vw, 520px)`) with the − / + stepper under it. Right: the title and lead text, then the **card**. The whole thing is vertically centred. |
| 600–959px | One centred column: title and lead, ring (`min(84vw, 480px)`), stepper, then the card (max 560px). |
| < 600px | Header (title only), a **compact card**, the **full-width grid** (about 42px cells on a 390px screen), then the **thumb wheel** docked at the bottom with − 200° + above it. It must fit a 390 × 844 screen with no page scroll, using `100dvh` and the safe-area inset at the bottom. |

### Page background

The page takes on the current hue: background `hsb(h, 12, 90)`, ink `hsb(h, 60, 20)`, secondary ink `hsb(h, 40, 38)`. It fades with a 500ms transition, which is off when reduced motion is on. This continues the original app's tinted background, and the user specifically wants to keep it.

### The ring (tablet and desktop)

- It's a conic gradient made of 72 hard-edged 5° segments, each coloured `hsb(i*5, 85, 92)`. It's masked to a ring whose inner radius is 0.36d. Notch lines are drawn at every stop, with longer ones every 45°.
- The thumb is a circle on the ring filled with `hsb(h, 85, 92)`, with a 5px white border and an ink outline. Its rotation follows a **continuous turn value**, so going from 355° to 0° moves forward one notch rather than spinning back a full lap.
- Pointer: click or drag anywhere on the ring to set the angle. The mouse wheel steps ±5°.
- The 8×8 grid sits inside the ring, inset by 0.215d.

### The thumb wheel (phones)

The ring becomes the visible top edge of a large wheel with radius R = 520 and a band 74px thick. It sits in a 150px-tall area at the bottom of the screen with a fixed pin at the top centre, and the wheel rotates under the pin. Hue labels every 45° follow the curve of the wheel.

- **Drag:** a horizontal drag turns the wheel continuously by `Δx / R` radians. Dragging left increases the hue. The hue snaps to the nearest 5° live as notches pass under the pin, so the grid and background update while you drag.
- **Inertia:** velocity is measured over the last 80ms of movement. On release, if the speed is above 0.04°/ms, the wheel coasts with `FRICTION = 0.9975` per ms and `FLICK_GAIN = 1.5`, stops below 0.008°/ms, and then eases onto the nearest notch (0.18s). A hard flick of about 3,000 px/s travels around 200°. Touching the wheel while it coasts catches it. The − / + buttons and the arrow keys stop the coast before they step.
- **Tap** (moved less than 6px): jump to the tapped segment.
- **Reduced motion:** no coasting; it stops where you let go. No eased snap either.
- `touch-action: pan-y`, so vertical scrolling still works.
- Announce the hue to screen readers once, when the wheel comes to rest, not on every notch.

### Safe areas and system gestures (every size, mostly phones)

- Add `viewport-fit=cover` to the viewport meta tag, and `interactive-widget=resizes-content`.
- Fit the one-screen layout with `min-height: 100svh` rather than `dvh`. `svh` is the smallest viewport, so the layout never jumps when the browser toolbars change size, and it always fits with the toolbars showing.
- Pad the page with `max()` so ordinary screens keep their normal gutter and the inset only takes over where it's larger:
  - top: `max(12px, env(safe-area-inset-top))`
  - sides: `max(12px, env(safe-area-inset-left))` and `max(12px, env(safe-area-inset-right))`. Phones in landscape have side insets because of the notch.
  - the wheel area's bottom: `max(8px, env(safe-area-inset-bottom))`
- On the wheel: `overscroll-behavior: contain` plus `touch-action: pan-y`, so dragging it never triggers pull-to-refresh or the page bounce.
- **Edge swipes:** no CSS or web API can detect where the system's edge-swipe zones are. iOS Safari's back gesture starts from the left edge, and Android's from either side edge. Because every pick pushes a history entry, an accidental back gesture would undo a colour. So **a wheel drag only starts from a pointer down at least 24px in from each side** of the viewport. A pointer down closer to the edge still works as a tap. The − / + buttons remain the fallback.
- Check these in a real browser with device emulation for a phone with a notch, in both portrait and landscape.

### The stepper (every size)

− and + buttons, each 44px or larger, step the hue by 5° and wrap from 355 to 0. Between them is the current value in degrees. This is the **WCAG 2.2 SC 2.5.7 alternative to dragging**, so it must always be present. Consider Base UI `NumberField` if it fits without fighting it; otherwise use plain buttons.

### The grid

- Brightness 100 is the **top** row and 12 the bottom. Saturation runs 12 → 100 from left to right. Note that this is **flipped vertically** from the old app.
- Cells are rounded squares with a 3px gap (4px on phones). The selected cell scales to 1.3, becomes a circle, and gets a white ring plus an ink ring.
- It's an ARIA `grid` with a **roving tabindex**, so the whole grid is one tab stop. The arrow keys move focus, Home and End go to the start and end of the row, Enter or Space picks the focused cell (or deselects it if it's already picked), and Esc clears the selection. Each cell's label reads like "Saturation 62, brightness 75, #4998BF", and the grid's label includes the hue.
- Base UI has no public grid or composite primitive. Check the current docs, and if that's still true, write the small roving-tabindex grid yourself.

### The card

- On top is a swatch block in the picked colour: 120px tall, with 24px top corners. Below it is a translucent white panel with 24px bottom corners.
- **Format switch:** a `ToggleGroup` with HSB, RGB and Hex, defaulting to Hex. The choice is remembered per viewer in `localStorage`, wrapped in try/catch, and the app must work without it.
- **Value:** large (up to 54px, weight 800), with a **Copy {format}** button beside it. Copying uses `navigator.clipboard` (drop the `copy-to-clipboard` dependency) and shows a Base UI `Toast` reading "Copied Hex #4998BF".
- **Other formats:** a smaller line showing the two formats not currently selected.
- **Contrast:** two chips, for white text and black text, each showing an "Aa" sample, the WCAG ratio and its grade (AAA ≥ 7, AA ≥ 4.5, AA large ≥ 3, otherwise "fails").
- **Nothing picked:** the swatch is a dashed outline, the value shows "Pick a colour" muted, and Copy is disabled.
- **Phones:** the swatch shrinks to 44px, the value and Copy share one row, and the format switch sits below them. The other formats and the contrast chips are hidden.

### Typography

Bricolage Grotesque (variable, weights 400/600/800) with tabular numbers. **Self-host it** using `@fontsource-variable` or similar, with a preload and `font-display: swap`. A Google Fonts request would cost Lighthouse points.

### URL and history

- **Pick or deselect a cell:** `push`.
- **Ring or wheel drag in progress:** `replace`, or keep it local and don't touch the URL until the gesture ends. Gesture end or coast settle: `push`. Stepper or keyboard step: `push`. The aim is that Back steps through the colours you actually chose, not every pixel of a drag.
- **Document title:** `HSB(200,62,75) | Huebo`, or `Hue: 200 | Huebo` when nothing is picked. Match today's format.

### Accessibility bar

The bar is Lighthouse Accessibility 100, plus a manual check. Specifically:
- Keyboard-only use must work everywhere.
- Focus must always be visible.
- The hue slider needs `aria-valuetext` like "200 degrees, azure", and Shift with an arrow key steps 45°.
- Live-region announcements: "Picked #4998BF", "Selection cleared", and the hue on settle.
- Reduced motion must be respected.
- Text contrast must pass on every hue background.
- Every target must be at least 24px (WCAG 2.5.8). In practice the grid cells are 42px on phones and about 30px on tablets.

## Architecture requirements (from the user)

- **Stack:** latest TypeScript, TanStack Router, Valibot, StyleX and Base UI (`@base-ui/react`), with the React Compiler enabled. Use retrieval rather than memory: check each library's current docs and versions before using its API. The repo's dependency policy requires releases at least 3 days old (see `pnpm-workspace.yaml`).
- **Strict TypeScript** that catches dead code: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, and so on. Add a `check:types` script.
- **Type safety is paramount. No hacks, no cheating:** no `as` casts without a safety comment, no `any`, no lint suppressions.
- **Make impossible states unrepresentable.** For example, a selection is `{ saturation: Step; brightness: Step } | null`, never two independent nullables. Use Valibot to parse route params into branded `Hue` and `Step` types at the router seam. Below that seam, nothing should ever re-check whether a value is valid.
- **Vertical slices with colocation:** what changes together stays together. Only genuinely shared concepts go in `src/shared/`, such as the colour maths and design tokens. A plausible shape, which is yours to improve:
  - `src/shared/color/`: HSB to RGB/Hex, contrast, hue names (deep and pure, with node tests)
  - `src/picker/`: the route, the page layout and the URL/state seam
  - `src/picker/hue-dial/`: the ring and wheel presentations of one hue control, plus inertia
  - `src/picker/swatch-grid/`
  - `src/picker/color-card/`
- **StyleX design system:** keep it minimal. Only things that are truly reused go in, such as the hue-derived colour variables, radii, the type scale, the focus ring and the motion tokens. Leave one-off styles colocated with their component. The hue-driven theme is dynamic at runtime, so check how StyleX currently recommends dynamic values, whether that's `defineVars` plus inline variables or dynamic styles.
- **React Compiler:** enable it in the Vite/Babel config, and enable whatever oxlint rules enforce compiler-compatible code (React hooks and compiler rules; check what oxlint supports today). Don't hand-write `useMemo` or `useCallback`.

## Process (in this order)

1. **Branch.** Make sure you're on top of the latest `origin/master` (`git fetch && git log origin/master -1`; it should include `732cfcc`, the Oxfmt and CI change). Create the branch `ec/dial-redesign`.
2. **Lint first, then commit before any other work.** Bring in the anti-slop oxlint rules the user set up in another project:
   - Copy `tools/oxlint/anti-slop/` from `/Users/ec/.t3/worktrees/squarespace-cli/t3-dec7ac53` with its `PROVENANCE.md`. That repo vendored them in commit `6518245` and wired them up in `f305566`, so read both. Skip the `effect/` plugin, since Huebo doesn't use Effect.
   - Follow that repo's `oxlint.config.ts`: correctness, suspicious and perf categories as errors; size and complexity limits; `import/no-cycle`; and every applicable `anti-slop/*` rule as an error. Add the React, react-hooks/compiler and JSX-a11y plugins as appropriate.
   - Keep the existing `pnpm check` (Oxfmt, lint, test and build in parallel) and CI working.
   - Commit this first, on its own.
3. **Stack migration.** Move to TypeScript, TanStack Router, Valibot, StyleX, Base UI and the React Compiler. Remove React Router, react-motion, prop-types and copy-to-clipboard.
4. **Build the slices** against the spec above. Keep commits small and logical.
5. **Tests.** Audit every existing test for effectiveness, and delete tautological and snapshot tests.
   - New tests are **user-focused, in given/when/then form**. For example: "given a shared link to /200/62/75, when the page loads, then #4998BF is picked and Copy Hex is enabled."
   - Prefer DOM tests in a real browser (Vitest Browser Mode with Playwright, if that fits) for interaction: the keyboard grid, the stepper, URL push and back, deselecting, copy and toast, and the format preference.
   - Write **unit tests only where the number of permutations justifies a fast node test**: the colour golden test (72 × 64), route param parsing, and the inertia maths if you extract it as a pure function.
6. **Real browsers.** Check the design with `agent-browser` (installed; see the `agent-browser` skill) at 390×844, 820×1180 and 1280×820. Compare screenshots against the prototype and the PNGs. Test the wheel by dragging, flicking and tapping.
7. **Lighthouse 100** in every category, on both mobile and desktop presets, against `pnpm build && pnpm preview` (for example `npx lighthouse <url> --preset=desktop` and the default mobile run). Record the scores in your final report.
8. **Haiku validation.** After each meaningful milestone, start a Claude Haiku subagent (the Agent tool with `model: "haiku"`). Give it a concrete checklist from this spec and the preview URL. It drives a real browser with agent-browser and reports pass or fail with screenshots. Fix what it finds and re-check. Haiku only verifies; it doesn't write code.

## Git rules

- Use the humanizer skill for commit messages.
- Work in small, logical commits on `ec/dial-redesign`. **Don't push or open a PR**; report back instead.
- Never use bare `git stash`, because the stash is shared with other worktrees.

## Definition of done

- Every URL in the old format renders the same colour, and invalid paths redirect to `/60`.
- The dial matches the prototype at all three widths, including the wheel's inertia, tapping and catching.
- `pnpm check` passes: format, lint (with anti-slop), strict types, tests and build.
- Lighthouse is 100 in every category on mobile and desktop.
- The final report covers:
  - the commit list
  - the module map, with each module's interface
  - the test inventory, noting what was deleted and why
  - the Lighthouse scores
  - Haiku's validation results
  - every decision you made that the user should know about, such as the service worker, analytics and anything that couldn't be met
