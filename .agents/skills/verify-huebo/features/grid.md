# Grid

The grid shows 64 squares for the current hue: 8 saturations across and 8 brightnesses down. Picking one puts the full colour in the link and on the card. Escape or picking again clears it.

## Sub-features

- `grid-pick` picks a square by clicking it, which sets `/:hue/:saturation/:brightness`.
- `grid-keys` moves with the arrow keys, picks with Enter, and clears with Escape.
- `grid-follows-hue` keeps the same saturation and brightness when the hue changes.

## How to get to it (user POV)

- Roomy layout: inside the ring. Compact layout: the middle of the screen.
- Keyboard: Tab into the grid, then use the arrows, Enter and Escape.

## Driving it with agent-browser

Preconditions:

- Baseline from the [README](./README.md), with `agent-browser open "$URL/200"`.

- **Pick (`grid-pick`).** Run `agent-browser find role button click --name "Saturation 62, brightness 75, #4998BF"`, then `agent-browser wait --url "**/200/62/75"`. `agent-browser get attr 'td[aria-selected="true"] button' aria-label` starts with `Saturation 62, brightness 75`, and the title is `#4998BF · HSB 200 62 75 | Huebo`. `history.length` goes up by 1.
- **Keys (`grid-keys`).** Run `agent-browser focus 'td[aria-selected="true"] button'`, then `press ArrowRight` and `press Enter`. The URL is `/200/75/75`. Then press `Escape`, and the URL is `/200` and `agent-browser eval "document.querySelector('td[aria-selected=true]')"` is `null`.
- **Follows hue (`grid-follows-hue`).** From `/200/62/75`, click `Increase hue by 5 degrees`. The URL is `/205/62/75`, and the picked square's label starts with `Saturation 62, brightness 75`.
- **Proof.** Run `snapshot -c > $EVIDENCE/grid/<step>.aria.txt` and `screenshot $EVIDENCE/grid/<step>.png`, and record the URL and title in `steps.txt`.

## Gotchas

- A square's accessible name includes the hex, which changes with the hue. Match on the `Saturation <s>, brightness <b>,` prefix when the hue isn't fixed.
- Only saturations and brightnesses 12, 25, 38, 50, 62, 75, 88 and 100 exist. Any other number in a link redirects. See [Links and history](./links-and-history.md).
- Arrow keys only move focus inside the grid. Enter is what writes the URL.
