# Popups and radios come from the platform, not a component library

Help, Copy's confirmation and the format radios were built on Base UI. Together they cost 135 KB of a 492 KB script, more than a quarter of it, for three small parts. They are now built on the platform instead:

- **Help** is a `<dialog popover>` opened by `popovertarget`. The browser gives the toggle, Escape, light dismiss, the top layer and `aria-expanded`. CSS anchor positioning hangs it below Help and flips or shifts it to stay on screen. `@starting-style` and `transition-behavior: allow-discrete` animate it in and out. Huebo adds two things Base UI did: focus moves to the link on open, and back to Help after a click outside or a Tab out.
- **Copy's confirmation** is a `popover="manual"` anchored to Copy, shown and hidden by a timer store (`confirmation.ts`) read through `useSyncExternalStore`. Screen readers hear it through the app's `Announcer`.
- **The format radios** are `<input type="radio">`, so arrow keys, wrapping and Tab already behave as they should.

The animations, timings and positions match Base UI's frame for frame, and the Help and card tests pass against both.

## Considered options

- **Keep Base UI.** It costs nothing to maintain, but a quarter of the script ships for three parts, and it stays in the bundle however few parts are used, because its popover pulls in hover, safe-polygon and focus-trap code that Huebo never runs.
- **Lazy-load Help.** That would shrink the first load, not the total, and the toast and radios would still need Base UI.

## Consequences

- Copy's confirmation is no longer a focusable dialog in a `Notifications` landmark. It loses Base UI's swipe to dismiss, its pause on hover, and F6. It lasts 1.8 s and repeats nothing a person needs to act on.
- In browsers without CSS anchor positioning, Help and the confirmation fall back to the centre of the screen. In browsers without `overlay` transitions, they leave the top layer as soon as they start to close.
- Base UI used to fix edge cases for us. Now we fix them.
