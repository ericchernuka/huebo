# Page and layout

The page fits one screen at every size. Wide screens put the ring, grid and card side by side. Phones and short screens use the compact layout, with the wheel along the bottom. The whole page, including the strip behind the phone's status bar and floating toolbar, takes a light tint of the current hue, and the page doesn't rubber-band. Help explains the controls.

## Sub-features

- `layout-switch` uses the compact layout at `(max-width: 599px), (max-width: 959px) and (max-height: 939px)`, and the roomy layout otherwise.
- `page-tint` gives `html` and the `theme-color` meta the hue's tint, which follows the dial live.
- `page-no-bounce` sets `overscroll-behavior: none` on the root, so the page doesn't pull past its edges.
- `help` makes the `Help` button open the `Picking a colour` dialog, and Escape closes it.

## How to get to it (user POV)

- Resize the window, or open on a phone.
- The `?` button in the header.

## Driving it with agent-browser

Preconditions:

- Baseline from the [README](./README.md).

- **Roomy (`layout-switch`).** Run `agent-browser set viewport 1280 900` and `open "$URL/200"`. The slider's box is the 520 px ring, and a screenshot shows the ring, grid and card side by side.
- **Compact (`layout-switch`).** Run `set viewport 390 844` and `open "$URL/200"`. The slider's box spans the full width along the bottom. Also check `set viewport 900 900` (narrow and short), which is compact too.
- **Tint (`page-tint`).** Run `agent-browser eval "[getComputedStyle(document.documentElement).backgroundColor, document.querySelector('meta[name=theme-color]').content]"`. At `/200` that's `rgb(202, 220, 230)` and `#CADCE6`. Click `Increase hue by 5 degrees`, and both change.
- **No bounce (`page-no-bounce`).** Run `agent-browser eval "getComputedStyle(document.documentElement).overscrollBehaviorY"`. It's `none`.
- **Help (`help`).** Run `agent-browser find role button click --name "Help"`. `snapshot -c` shows the dialog `Picking a colour` with two paragraphs. Then `press Escape`, and the dialog is gone.
- **Proof.** Take screenshots at `1280 900`, `900 900` and `390 844` into `$EVIDENCE/page-and-layout/`, and record the `eval` outputs in `steps.txt`.

## Gotchas

- Change the viewport before `open`, or `reload` after, so the layout query is evaluated fresh.
- The `html` background has a 500 ms transition. Without `input.mjs front`, the tab is hidden, the transition never runs, and the background reads `rgba(0, 0, 0, 0)`. Wait about 600 ms after a change before reading it.
- An Escape that the page doesn't swallow hides agent-browser's tab, and closing Help with Escape is one. Run `input.mjs front` after every Escape, or later transitions freeze at their first frame and Help reads as invisible while open.
- The status-bar and toolbar strip only shows on a real phone browser. Here, `page-tint` checks the root background and `theme-color`, which are what that strip uses.
