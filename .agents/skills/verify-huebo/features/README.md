# Huebo verification map

One recipe per feature a person can see and touch. Driving conventions and proof standards live in [SKILL.md](../SKILL.md).

## Baseline preconditions

- A server from `.agents/skills/verify-huebo/huebo.sh launch <run-id>`, with `huebo.sh doctor <run-id>` passing.
- `URL`, `EVIDENCE` and `AGENT_BROWSER_SESSION` exported from `huebo.sh env <run-id>`.
- A fresh page: `agent-browser open "$URL/200"`, then `.agents/skills/verify-huebo/input.mjs front` once per session, so CSS transitions run. The session's `localStorage` may hold a format from an earlier recipe. Clear it with `agent-browser eval "localStorage.clear()"` before a recipe that starts from the default format, Hex.

## Feature entry contract

Each feature file starts with an H1 and a paragraph about what a person sees. Then come four H2s, in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with agent-browser`, and `Gotchas`. The driving section starts with `Preconditions:`, then has labelled bullets that each pair a person's action with exact commands and an observable result. Keep implementation details out, except where a trap needs one.

## Features

- [Hue dial](./hue-dial.md) covers the ring, the phone wheel, keys, the mouse wheel, − and +, and one history entry per choice.
- [Grid](./grid.md) covers making a pick by click or keyboard, and clearing it.
- [Card](./card.md) covers the format choice, Copy and its single confirmation, and the contrast readout.
- [Links and history](./links-and-history.md) covers deep links, the invalid-path redirect, Back and Forward, and the title.
- [Page and layout](./page-and-layout.md) covers the compact and roomy layouts, the page colour behind the browser chrome, and Help.
