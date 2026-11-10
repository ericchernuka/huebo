# Card

The card shows the chosen colour in HSB, RGB and Hex, lets a person pick which format to copy, copies it, and confirms with one toast. It also shows how readable white and black text are on the colour. The chosen format is remembered on this device.

## Sub-features

- `card-format` sets the format with the `Colour format` radio group (HSB, RGB or Hex). It's remembered across reloads.
- `card-copy` writes the shown value to the clipboard and shows `Copied <format> <value>`.
- `card-copy-dedupe` keeps one confirmation, never a stack, when Copy is pressed again and again.
- `card-contrast` shows the `Text contrast` list, with ratio and rating for white and black text.
- `card-empty` shows `Pick a colour` until a square is picked.

## How to get to it (user POV)

- The `Selected colour` region, beside the dial on wide screens and below the grid on phones.

## Driving it with agent-browser

Preconditions:

- Baseline from the [README](./README.md), with `agent-browser eval "localStorage.clear()"`, then `agent-browser open "$URL/200/62/75"`.

- **Values.** Run `agent-browser get text '[aria-label="Selected colour"]'`. It includes `#4998BF`, `HSB 200,62,75`, `RGB 73,152,191`, `White text 3.2:1, AA large` and `Black text 6.5:1, AA`.
- **Copy (`card-copy`).** Run `agent-browser find role button click --name "Copy Hex"` and `agent-browser wait --text "Copied Hex #4998BF"`. Then `.agents/skills/verify-huebo/input.mjs read-clipboard` prints `#4998BF`.
- **Dedupe (`card-copy-dedupe`).** Click `Copy Hex` three times in a row. `agent-browser snapshot -s '[aria-label="Notifications"]'` lists exactly one dialog, `Copied Hex #4998BF`.
- **Format (`card-format`).** Run `agent-browser find role radio click --name "RGB"`. The copy button's name becomes `Copy RGB`. Then `agent-browser reload`, and the `RGB` radio is still checked (`snapshot -c` shows `checked=true`).
- **Empty (`card-empty`).** Open `"$URL/200"`. The card reads `Pick a colour`.
- **Proof.** Run `snapshot -c > $EVIDENCE/card/<step>.aria.txt` and `screenshot $EVIDENCE/card/<step>.png`. Put the clipboard output in `steps.txt`.

## Gotchas

- `agent-browser clipboard read` is denied in this browser. Use `input.mjs read-clipboard`, which grants the permission for this tab's origin and reads.
- The toast closes on its own after a few seconds. Snapshot it right after the click.
- A failed write shows `Couldn't copy <format>` and no tick. agent-browser can't make the clipboard fail on demand, so that path is `not driven`. `src/picker/color-card/__tests__/ColorCard.test.tsx` covers it.
- The format persists in `localStorage`, so clear it before a recipe that expects Hex.
