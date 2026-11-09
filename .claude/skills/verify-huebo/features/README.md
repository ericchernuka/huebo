# Huebo verification map

This folder is the maintained source for verifying what a person can see and do in Huebo. Read this index before you drive the app, then use the matching feature file as the recipe.

## Baseline preconditions

- A server from `.claude/skills/verify-huebo/huebo.sh launch <run-id>`, with `huebo.sh doctor <run-id>` passing.
- `URL`, `EVIDENCE` and `AGENT_BROWSER_SESSION` exported from `huebo.sh env <run-id>`.
- A fresh page: `agent-browser open "$URL/200"`, then `.claude/skills/verify-huebo/input.mjs front` once per session, so CSS transitions run. The session's `localStorage` may hold a format from an earlier recipe. Clear it with `agent-browser eval "localStorage.clear()"` before a recipe that starts from the default format, Hex.
- Never drive a server or browser session that this run didn't start.

## Driving conventions

- Set the viewport before `open`. `1280 900` gives the roomy layout (ring), and `390 844` gives the compact layout (wheel along the bottom).
- Prefer roles and accessible names (`find role button click --name …`, `[role="slider"][aria-label="Hue"]`) over CSS classes or position.
- Coordinates are only for the dial. Derive them from `agent-browser get box '[role="slider"]'` each time.
- Mouse wheel and touch go through `.claude/skills/verify-huebo/input.mjs`. Clicks, drags with a mouse, and keys go through agent-browser.
- `eval` only reads: `history.length`, `document.title`, `localStorage`, attributes. It never drives.

## Proof and skip reporting

- Capture the action (`steps.txt`), the state after it (`*.aria.txt` from `snapshot -c`, and a `*.png`), and the side effects (URL, `history.length`, title, theme colour, clipboard, `localStorage`).
- Record `history.length` before and after any choice, because one entry per finished choice is the promise.
- Put artifacts in `$EVIDENCE/<feature-id>/` and name the sub-feature IDs in `steps.txt`.
- When a sub-feature can't be driven with this harness, write `not driven: <why>` and name the browser test that covers it. Don't count it as verified.

## Feature entry contract

Each feature file starts with an H1 and a paragraph about what a person sees. Then come four H2s, in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with agent-browser`, and `Gotchas`. The driving section starts with `Preconditions:`, then has labelled bullets that each pair a person's action with exact commands and an observable result. Keep implementation details out, except where a trap needs one.

## Features

- [Hue dial](./hue-dial.md) covers the ring, the phone wheel, keys, the mouse wheel, − and +, and one history entry per choice.
- [Swatch grid](./swatch-grid.md) covers picking a saturation and brightness by click or keyboard, and clearing it.
- [Colour card](./colour-card.md) covers the format choice, Copy and its single confirmation, and the contrast readout.
- [Links and history](./links-and-history.md) covers deep links, the invalid-path redirect, Back and Forward, and the title.
- [Page and layout](./page-and-layout.md) covers the compact and roomy layouts, the page colour behind the browser chrome, and Help.
