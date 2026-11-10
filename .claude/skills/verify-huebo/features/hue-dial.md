# Hue dial

The dial chooses the hue, in 5° stops from 0 to 355. In the roomy layout it's the ring around the grid. In the compact layout it's the wheel of segments along the bottom that you tap, drag or flick, and a flick coasts. − and + step it by 5°. While the hue moves, the page shows it live, and the link changes once, when the choice is finished.

## Sub-features

- `dial-ring-point` sets the hue by clicking or dragging on the ring. A drag is one history entry.
- `dial-keys` steps 5° per arrow, 45° per PageUp, PageDown or Shift+arrow, and jumps with Home and End.
- `dial-scroll` turns 5° per mouse-wheel notch over the ring, and makes one choice after the notches pause.
- `dial-stepper` makes one 5° step per − or + press. Each press is a history entry.
- `dial-wheel-tap` chooses the tapped segment on the wheel.
- `dial-wheel-flick` makes the phone wheel coast after a flick, then land once.
- `dial-wheel-drag` turns the wheel with a slow drag, which lands where it's let go.
- `dial-wrap` wraps 355 → 0 and 0 → 355, keeping any pick.

## How to get to it (user POV)

- Roomy layout (`1280 900`): the ring, the thumb on it, and the − and + below it.
- Compact layout (`390 844`): the wheel along the bottom edge, with − and + above it.
- Keyboard: Tab to the `Hue` slider, then arrows, PageUp, PageDown, Home and End.
- Mouse wheel: scroll with the pointer over the ring.

## Driving it with agent-browser

Preconditions:

- Baseline from the [README](./README.md), and `agent-browser open "$URL/200"` at the layout the step names.
- `agent-browser eval "history.length"` recorded before each step as `before`.

- **Stepper (`dial-stepper`).** At `1280 900`, run `agent-browser find role button click --name "Increase hue by 5 degrees"`, then `agent-browser wait --url "**/205"`. `history.length` is `before + 1`, and `document.title` is `Hue 205 and its 64 shades | Huebo`.
- **Keys (`dial-keys`).** Run `agent-browser focus '[role="slider"][aria-label="Hue"]'`, then `agent-browser press ArrowRight` twice and `agent-browser wait --url "**/210"`. `history.length` is `before + 2`, because each press is a keydown and a keyup. `press Shift+ArrowRight` moves 45°. `press Home` goes to `/0`.
- **Ring drag (`dial-ring-point`).** From the ring box (x 104, y 155, 520 square at 1280×900), run `agent-browser mouse move 364 180`, `mouse down`, `mouse move 534 245`, `mouse move 600 415`, `mouse up`. The URL ends at `/90`, and `history.length` is `before + 1`.
- **Mouse wheel (`dial-scroll`).** Run `.claude/skills/verify-huebo/input.mjs wheel 364 180 100 3`. Right after, `get attr '[role="slider"]' aria-valuenow` reads 15° past the start. After `agent-browser wait --url "**/<start+15>"`, `history.length` is `before + 1`.
- **Wheel tap (`dial-wheel-tap`).** At `390 844`, get the box (bottom 158 px). Run `input.mjs tap 300 770`. The URL changes to the tapped segment's hue, and `history.length` is `before + 1`. A tap at the centre, `195 770`, picks the hue already on show and adds no entry.
- **Wheel flick (`dial-wheel-flick`).** Run `input.mjs swipe 300 770 120 60 6`. `aria-valuenow` keeps climbing over the next second, for example 230, then 280. Wait until two reads 500 ms apart match, then check that the URL matches `aria-valuenow` and that `history.length` is `before + 1`.
- **Wheel drag (`dial-wheel-drag`).** Run `input.mjs swipe 300 770 200 800 10`. `aria-valuenow` stops when the finger lifts, the URL matches it, and `history.length` is `before + 1`.
- **Wrap (`dial-wrap`).** Open `"$URL/355/62/75"`, then click `Increase hue by 5 degrees`. The URL is `/0/62/75`.
- **Proof.** Run `agent-browser snapshot -c > $EVIDENCE/hue-dial/<step>.aria.txt` and `agent-browser screenshot $EVIDENCE/hue-dial/<step>.png` after each step. Write each step's URL and `history.length` (before and after) into `$EVIDENCE/hue-dial/steps.txt`.

## Gotchas

- agent-browser can't hold a key down, so "a held arrow shows the hue live and adds one entry" is `not driven`. `src/picker/hue-dial/__tests__/HueDial.test.tsx` covers it: "given the dial has focus, when an arrow key is held down…".
- The centre of the ring is the grid, so aim pointer input at the band, about 235 px from the centre at 1280×900.
- A flick needs speed. Separate agent-browser `mouse` calls are too slow to flick, and they read as a placement.
- Interrupting a coast (with a pick, + or Back) is timing-sensitive by hand. The browser tests "given a coasting wheel, …" in `HueDial.test.tsx` and `/verify-dial-motion` cover those orders.
- Known bug: pressing + and then − before the URL updates leaves the page on the + hue. Clicks through agent-browser are too far apart to trigger it. See `/verify-dial-motion`.
