# The link is the only stored colour

A colour lives only in the link (`/hue` or `/hue/saturation/brightness`), never in `localStorage` or app state that outlives a render. That makes every colour shareable, and Back and Forward step through choices for free. It's also why previews must not navigate (each choice is one history entry) and why the dial needs a landing state that holds the screen until the router catches up. `localStorage` keeps only the format, which is a device preference, not a colour.
