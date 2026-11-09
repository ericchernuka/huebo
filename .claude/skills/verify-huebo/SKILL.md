---
name: verify-huebo
description: Drive the real Huebo web app (the HSB colour picker, its hue dial, swatch grid and colour card) in a browser with agent-browser and capture proof that a feature works the way a person uses it. Use after changing anything a user can see or touch in src/, when asked to verify, demo, screenshot or "check it in the browser", or before saying a UI change works.
---

# Verify Huebo in a real browser

Huebo is a single-page React app served by Vite. A person touches it through a web page: the hue dial (a ring on wide screens, a wheel along the bottom on phones), the − and + buttons, the 8×8 swatch grid, the colour card, and Help. Every choice lives in the URL (`/:hue` or `/:hue/:saturation/:brightness`), so Back and Forward are part of the product. There is no backend, no auth and no data dir. The only stored state is the colour format, in the browser's `localStorage`.

The harness is the `agent-browser` CLI (0.37 or newer), plus two helpers that ship with this skill:

- `huebo.sh` starts, checks and stops a dev server.
- `input.mjs` sends the input agent-browser can't: wheel notches and touch swipes at coordinates, and a clipboard read.

The feature map in [features/README.md](features/README.md) is the recipe book. Read it before you drive anything.

Run every command from the repo root.

## Launch

```sh
.claude/skills/verify-huebo/huebo.sh launch <run-id>
eval "$(.claude/skills/verify-huebo/huebo.sh env <run-id>)"
export AGENT_BROWSER_SESSION="$SESSION" URL
```

`launch` installs dependencies if `node_modules` is missing. It then starts Vite on a free port bound to `127.0.0.1` and waits until the app is usable. Usable means two things: `/` serves the Huebo HTML, and `/src/main.tsx` compiles. It prints `Huebo ready at http://127.0.0.1:<port>`. `env` prints `URL`, `EVIDENCE` and `SESSION`. `SESSION` is an agent-browser session named for this worktree and run, so you never drive someone else's browser.

Each run id gets its own port, browser session and evidence folder, so two runs can go side by side. Pick a run id that says what you're proving, such as `dial-flick` or `pr-11`.

## Doctor

```sh
.claude/skills/verify-huebo/huebo.sh doctor <run-id>
```

This is read-only. Run it first, and again whenever anything looks off. It checks four things:

- The server process this run started is alive.
- That same process owns the port.
- The page serves Huebo and compiles.
- The checkout is still at the commit it launched from.

It also notes uncommitted changes in `src/`, because Vite serves them as they are. Don't drive an instance whose doctor fails. Stop it and launch again.

## Drive

Start from a known page and size:

```sh
agent-browser set viewport 1280 900      # roomy layout: ring, grid and card side by side
agent-browser set viewport 390 844       # phone: compact layout with the wheel at the bottom
agent-browser open "$URL/200"
.claude/skills/verify-huebo/input.mjs front   # make the tab visible
agent-browser wait --text "Huebo"
```

Run `input.mjs front` once after the first `open` of a session. agent-browser's tab otherwise reports `document.visibilityState === "hidden"`, and Chrome then freezes CSS transitions at their first frame. The page background would read transparent, and Help would never finish closing. It stays visible across later `open` calls.

The layout switches at `(max-width: 599px), (max-width: 959px) and (max-height: 939px)`. Set the viewport before `open`, or reload after changing it.

These are the stable handles. Use them, not CSS classes or the order of elements:

| What | Handle |
| --- | --- |
| Hue dial (ring or wheel) | `[role="slider"][aria-label="Hue"]`, with `aria-valuenow` as the hue on show |
| − and + | `find role button click --name "Decrease hue by 5 degrees"` and `"Increase hue by 5 degrees"` |
| A swatch | `find role button click --name "Saturation 62, brightness 75, #4998BF"`. The name starts with `Saturation <s>, brightness <b>,` |
| The picked swatch | `td[aria-selected="true"]`, whose `button` carries the name |
| Format | `find role radio click --name "RGB"` (or `HSB`, `Hex`) |
| Copy | `find role button click --name "Copy Hex"`. The name follows the format |
| Copy confirmation | the dialog `Copied Hex #4998BF` inside the region `Notifications` |
| Help | `find role button click --name "Help"`, which opens the dialog `Picking a colour` |

Read state through what a person or the browser sees: `agent-browser get url`, `agent-browser get attr '[role="slider"]' aria-valuenow`, `agent-browser eval "history.length"`, `agent-browser eval "document.title"`, and `agent-browser snapshot -c`.

The dial needs input at coordinates. Get them from the element's box each time, because the layout moves with the viewport:

```sh
agent-browser get box '[role="slider"]'        # x, y, width, height
```

At 1280×900 the ring's box is 520 px square, at x 104, y 155. Its centre is the grid, so point at the ring band, about 235 px out from the centre. At 390×844 the wheel band fills the bottom 158 px, at y 686–844.

- **Ring click or drag.** Use `agent-browser mouse move <x> <y>`, `mouse down`, `mouse move …`, `mouse up`. Angle 0° is at the top, and the angle grows clockwise.
- **Mouse wheel over the ring.** Run `.claude/skills/verify-huebo/input.mjs wheel <x> <y> 100 <notches>`. Each notch is +5°, and the commit comes 250 ms after the last notch. Don't use `agent-browser mouse wheel`, because it always fires at (0, 0) and never reaches the ring.
- **Phone wheel.** Run `input.mjs tap <x> <y>` or `input.mjs swipe <x1> <y> <x2> <ms> [steps]`, which send real touch events with real timing. A flick is about 180 px in 60 ms. A slow drag is the same distance over 600 ms or more.
- **Keys.** Run `agent-browser focus '[role="slider"]'`, then `agent-browser press ArrowRight` (or `PageUp`, `Home`, `End`, `Shift+ArrowRight`). Each `press` is a keydown and a keyup, so each one is a finished choice.
- **Back and Forward.** Run `agent-browser back` and `agent-browser forward`.

## Evidence

Put every artifact in `$EVIDENCE/<feature-id>/`, which is `.verify/evidence/<run-id>/<feature-id>/`. This folder is gitignored and survives cleanup. For each claim, capture three things:

- **The action:** the exact commands, in a `steps.txt` next to the artifacts.
- **The resulting state:** `agent-browser snapshot -c > $EVIDENCE/<id>/<step>.aria.txt` and `agent-browser screenshot $EVIDENCE/<id>/<step>.png`.
- **The side effects:** the URL, `history.length`, and where it matters `document.title`, the `theme-color` meta, `localStorage`, or the clipboard (`input.mjs read-clipboard`).

Proof standards:

- Drive the real path a person uses. Use clicks, keys, wheel and touch, never `eval` that calls app code, sets state or dispatches synthetic events. Use `eval` only to read.
- Record the state before and after. "One history entry per choice" needs `history.length` both before and after.
- For anything that moves over time (a coast, a scroll pause, a toast), wait for the end state with `agent-browser wait --url` or `wait --text`. A fixed sleep is OK only when nothing observable marks the end, and then say so in `steps.txt`.
- Don't mock anything. There are no external systems. Analytics is off unless `VITE_GOOGLE_ANALYTICS_ID` is set, and `launch` doesn't set it.
- When a recipe step can't be driven, such as holding a key down, say so. Name the browser test that covers it instead. Never report it as verified through another path.

## Cleanup

```sh
agent-browser close
.claude/skills/verify-huebo/huebo.sh stop <run-id>
```

`close` closes only this run's browser session, which `AGENT_BROWSER_SESSION` names. `stop` kills only the pid this run started, and removes `.verify/runs/<run-id>/`. It never touches `.verify/evidence/`. Never kill Vite or Chrome by name, because other worktrees and agents run them too. When the evidence is no longer needed, delete `.verify/evidence/<run-id>/` yourself.

Run cleanup after a failed attempt too, so ports and browsers don't pile up.

## Helpers

- `huebo.sh launch|doctor|stop|env [run-id]`: run it with no arguments for usage. Its state is in `.verify/runs/<run-id>/`: `pid`, `port`, `commit`, `server.log`. Read `server.log` when launch fails.
- `input.mjs front`, `wheel <x> <y> <deltaY> [notches=1] [gapMs=30]`, `tap <x> <y>`, `swipe <x1> <y> <x2> <durationMs> [steps=8]`, `read-clipboard`. It needs `AGENT_BROWSER_SESSION` and `URL` exported, and it drives the active tab at `$URL`. It talks CDP to that session's own Chrome.

## Related

- `pnpm test` runs the browser tests in `src/**/*.test.tsx` (Vitest and Playwright). They cover states this harness can't reach, such as a held key.
- `/verify-dial-motion` checks the dial's motion machine against every order of inputs. Use it for questions about history and timing. Use this skill to show it working.
- Keep the map current with `/pstack:maintain-verification-skill`.
