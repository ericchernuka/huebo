# Links and history

Every colour has a link. `/:hue` opens a hue with nothing picked, and `/:hue/:saturation/:brightness` opens a picked colour. A broken link goes to `/60`. Back and Forward step through finished choices, never through every hue the dial passed on the way. The tab title names the colour.

## Sub-features

- `link-hue` opens a hue from a link like `/200`.
- `link-colour` opens a picked colour from a link like `/200/62/75`. Leading zeros (`/020`) still work.
- `link-invalid` redirects a path that doesn't parse (`/361`, `/abc`, `/200/13/75`) to `/60`.
- `history-back` restores the earlier colour on Back, and the dial shows it. Forward returns.
- `history-one-entry` adds one entry per finished choice. See [Hue dial](./hue-dial.md) for the per-input checks.
- `title` reads `Hue: <h> | Huebo`, or `HSB(<h>,<s>,<b>) | Huebo` with a pick.

## How to get to it (user POV)

- Paste or open a link. Use the browser's Back and Forward.

## Driving it with agent-browser

Preconditions:

- Baseline from the [README](./README.md).

- **Hue link (`link-hue`).** Run `agent-browser open "$URL/200"`. `aria-valuenow` is `200`, no `td[aria-selected="true"]` exists, and the title is `Hue: 200 | Huebo`.
- **Colour link (`link-colour`).** Run `agent-browser open "$URL/020/62/75"`. The dial reads `20`, and the selected cell's label starts with `Saturation 62, brightness 75`.
- **Invalid (`link-invalid`).** For each of `/361`, `/abc` and `/200/13/75`, run `agent-browser open "$URL<path>"`, then `agent-browser wait --url "**/60"`.
- **Back and Forward (`history-back`).** Open `/200`, then click `Increase hue by 5 degrees` twice (`/210`). Run `agent-browser back`, and the URL and `aria-valuenow` are `205`. Run `agent-browser forward`, and both are `210`.
- **Proof.** Record each URL, `aria-valuenow`, `document.title` and `history.length` in `$EVIDENCE/links-and-history/steps.txt`, and take a screenshot after Back.

## Gotchas

- `agent-browser open` adds a history entry of its own, so measure `history.length` from after the page loads, not from 1.
- Read `document.title` with `eval`. `tab list` can show a stale title.
- The redirect replaces the bad entry, so Back from `/60` goes to whatever came before the bad link.
