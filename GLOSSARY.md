# Huebo

Huebo helps a person choose a colour: first a hue on a dial, then a saturation and brightness from a grid, which they can then copy in the format they need.

## Colour

**Hue**:
One of 72 stops around the colour circle, from 0 to 355 in steps of 5.
_Avoid_: angle, degree value

**Step**:
One of the eight saturation or brightness levels: 12, 25, 38, 50, 62, 75, 88 or 100.
_Avoid_: level, percentage

**Pick**:
A chosen saturation and brightness for the current hue.
_Avoid_: selection, swatch

**Colour**:
A hue, plus a pick when one has been made.
_Avoid_: colour value, swatch

**Format**:
The notation Copy writes a colour in: HSB, RGB or Hex.
_Avoid_: mode, notation

## Controls

**Dial**:
The control that chooses the hue. It's a Ring in the roomy layout and a Wheel in the compact layout.
_Avoid_: picker, hue slider

**Ring**:
The dial as a circle around the grid, which a person points at, drags, scrolls or steers with keys.
_Avoid_: circle, wheel

**Wheel**:
The dial as an arc of segments along the bottom of a phone screen, which a person taps, drags or flicks.
_Avoid_: ring, carousel

**Stepper**:
The − and + buttons that move the hue by one stop.
_Avoid_: arrows, nudge buttons

**Grid**:
The 8 by 8 squares of every step pair for the current hue.
_Avoid_: swatch grid, palette

**Square**:
One cell of the grid, standing for one pick.
_Avoid_: swatch, cell, tile

**Card**:
The panel that shows the chosen colour in each format, with Copy and the text contrast.
_Avoid_: details panel, colour card

## Movement

**Shown hue**:
The hue on screen right now. While the dial moves, it can run ahead of the link.
_Avoid_: current hue, preview hue

**Choice**:
A finished input, such as a key coming up, a finger lifting, a scroll pausing, a pick, or a stepper press. Each choice is one history entry.
_Avoid_: change, update, commit

**Coast**:
The wheel spinning on by itself after a flick, slowing until it stops.
_Avoid_: momentum, inertia, spin

**Landing**:
The moment between a choice and the link catching up, while the screen holds the chosen hue.
_Avoid_: settling, pending

## Agents

**Agent tool**:
One of the WebMCP tools the page gives an AI agent: `read_colour`, `choose_colour`, `list_squares` and `choose_format`. An agent's choice is a choice like any other: one history entry.
_Avoid_: action, command, MCP endpoint

## Pages

**Link**:
The address of a colour: `/hue`, or `/hue/saturation/brightness` with a pick. It's the only place a colour is kept.
_Avoid_: URL state, route, permalink

**Compact layout**:
The single-column layout with the wheel, for phones and short screens.
_Avoid_: mobile view

**Roomy layout**:
The wide-screen layout: the ring around the grid, with the card beside it.
_Avoid_: desktop view
