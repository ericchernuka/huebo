---
name: verify-dial-motion
description: Exhaustively check the hue dial's motion machine (src/picker/hue-dial/motion.ts) and the page code around it against its promises about history and what's on screen. Use after any change to motion.ts, dial-motion.ts, inertia.ts, the router adapter in Picker.tsx (useLinkedDial), or the events Wheel, Ring, Stepper or HueDialRoot send; or when asked whether the dial can write a bad history entry, land a stale hue, or get stuck moving.
---

# Verify the dial's motion machine

`pnpm verify` runs every order of up to 7 steps (keys, ring, mouse wheel, ±, picks, an agent's choice, fingers, coast frames, scroll pauses, the router finishing a load, Back) through the real `transition` in `src/picker/hue-dial/motion.ts`, and checks five properties after every step. It explores about 3.7 million states in about 13 seconds, in a worker given a 6 GB heap in `vite.config.ts`. Breadth first search means each failure it prints is the shortest sequence that breaks that property.

## The properties

Each one is a plain promise, and the harm when it breaks.

1. **Only a finished choice writes history.** Holding a key, dragging, scrolling or a moving finger never commits. If it broke, Back would step through every intermediate hue.
2. **A coast or scroll never lands after something overtook it.** Once a choice, a new gesture or Back interrupts a coast or scroll, that run never commits. If it broke, the wheel would overwrite the person's choice a moment after they made it.
3. **The screen keeps showing a choice until the next input.** After a commit of hue h, the hue on screen stays h until the person does something else or goes Back, including after navigations finish. If it broke, the dial would jump to a hue nobody chose.
4. **Back stops anything moving on its own.** After a traverse, nothing is coasting, scrolling or landing. If it broke, a coast would keep spinning over the page the viewer just went back to.
5. **Nothing stays in motion once the page settles.** With nobody touching the page and every coast, pause and navigation finished, the dial is idle, or held only while a key is down, or turning only while its finger is down. If it broke, the dial would freeze in a preview state.

## Files

- `src/picker/hue-dial/__tests__/world.ts`: the world state (motion, what `useParams` returns, the browser's history entries, pending `navigate()` promises), the ghost fields that properties 2 and 3 track, and `send`/`deliver`.
- `src/picker/hue-dial/__tests__/actions.ts`: every step the person or the page can take, and when each one is possible.
- `src/picker/hue-dial/__tests__/take.ts`: applies one step and updates the ghost fields and fingers.
- `src/picker/hue-dial/__tests__/motion.verify.ts`: the properties, the search, and `DEPTH`.

The `verify` project in `vite.config.ts` runs `src/**/*.verify.ts`. `pnpm test` runs only `unit` and `browser`, so a red verify run doesn't block the suite.

## Coverage record

The check calls these directly, so they are covered as written:

- `motion.ts`: `transition` and everything it calls (`shownHue`, `choiceTransition`, `land`, `settleHistory`, `press`, `move`, `release`, `coastFrame`), and `nextLink`, which `world.ts` `deliver` calls to decide where a commit takes the link.
- `gesture.ts`: `startGesture`, `moveGesture` and `dragTurn`, reached through `transition`.
- `inertia.ts`: `recordSample`, `flickVelocity` and `coast`, reached through `transition`.

These are modeled by hand, so re-read them against the model whenever they change:

| Code                                                     | Model                                             | What the model assumes                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dial-motion.ts` `createDialMotion().send`               | `world.ts` `send`                                 | Motion updates before `onCommit` runs, and a commit's nested `landed` sees the new motion.                                                                                                                                                                                                                                                                                     |
| `dial-motion.ts` `createClocks.follow`                   | `actions.ts` `actions()`                          | A frame fires only while coasting, and a pause only while scrolling. Each frame is 40 ms (`MAX_FRAME_MS`).                                                                                                                                                                                                                                                                     |
| `dial-motion.ts` `connect`, `Picker.tsx` `useLinkedDial` | `world.ts` `deliver`, `actions.ts` `load`, `back` | When `nextLink` is null (compared against `useParams`), `landed` is sent at once. Otherwise the port's `navigate` calls TanStack's `navigate`, then sends `landed`. A history traverse sends `traverse`.                                                                                                                                                                       |
| TanStack `router-core` `commitLocation` and `load`       | `world.ts` `deliver`, `actions.ts` `load`, `back` | `navigate` pushes the history entry synchronously, unless it matches the newest entry. `useParams` changes only when a load finishes, and then it shows the newest entry. Each new commit promise also resolves the earlier ones, so they all resolve together, newest first. Back drops the newest entry and starts a load. Pending promises resolve when that load finishes. |
| `Wheel.tsx` press, move, release, cancel                 | `actions.ts` `fingerSteps`, `otherFingerSteps`    | A press sends the rotation pointing at the hue on show. Radius 520. Moves are 50 px left, 10 ms apart. Release comes 1 ms after the last move, with a tap angle of 20°.                                                                                                                                                                                                        |
| `Stepper.tsx`                                            | `KEYS` `+`/`−`                                    | Steps are ±5.                                                                                                                                                                                                                                                                                                                                                                  |
| `HueDialRoot.tsx` `keyInput`, `Ring.tsx`                 | `KEYS`                                            | Nudge +5, aim 100 (ring or Home/End), letGo for keyup, blur or lost capture.                                                                                                                                                                                                                                                                                                   |
| `Ring.tsx` `useScrollToTurn`                             | `KEYS` scroll                                     | Scroll +5 per notch.                                                                                                                                                                                                                                                                                                                                                           |
| `Picker.tsx` `useColourTools` callback, `agent/tools.ts` | `KEYS` agent                                      | `choose_colour` sends one `jump` with the whole colour, already resolved against the link: hue 40, pick 88/50 in the model.                                                                                                                                                                                                                                                    |

**Sync commit:** `b615493`, with TanStack `@tanstack/router-core` 1.171.39. The model was last confirmed to describe the code above at this commit. Move it forward only after you re-read each modeled row against the code at the new commit.

## Bounds and what is left out

- The search is 7 steps deep. "The coast runs until it stops" counts as one step and runs every real frame.
- Event values are fixed: one aim hue, +5 nudges and scrolls, ±5 steps, one pick, one agent colour, two fingers, and one drag distance. Bugs that need other angles, Shift steps, or many moves inside one gesture are outside the bound.
- Back is offered whenever there's an earlier entry, including mid-navigation. Forward and jumps send the same `traverse` event, but the entries they restore aren't modeled.
- Under this resolution order, the `motion.hue === event.hue` check in `settleHistory` can't change the outcome: a stale `landed` never reaches a newer landing. It's still worth keeping in case the router changes, but breaking it won't fail this check.
- Rendering is assumed current: the `shown` hue passed to `send` is `shownHue(motion, url)` at the moment of the event. React render lag isn't modeled.
- Announcements, analytics and the pixels on screen aren't checked.

## Run it

```sh
pnpm verify
```

A pass prints one passing test. A failure prints the broken property, a numbered list of steps in the page's own words, and an `→` line with what went wrong. To search deeper for one run, raise `DEPTH` in `motion.verify.ts`. Each extra level takes about 5 to 6 times as long, and depth 8 runs out of memory even with the larger heap.

## Known finding (open)

At `b615493` the check fails property 3:

```
Broken: the screen keeps showing a choice until the next input
  1. + is pressed
  2. − is pressed
  3. the router finishes loading
  → 200° was chosen, but 205° is on screen
```

`+` commits 205, and `navigate` pushes `/205`. `−` steps back to 200 before `useParams` updates. `nextLink` sees 200 already in the link, so the store lands without navigating. Then the load finishes on `/205`, and the page shows 205. `nextLink` is given what's rendered, while the router compares against its newest entry. A browser test that clicks `+` and `−` in the same task reproduces it: the URL ends at `/205`. This is a bug in the store's landing loop, not in the model. Until someone fixes it, this is the expected output. Any other failure is new.

## When it fails

1. Read the steps and replay them in the code: `motion.ts` for each `transition`, then the modeled row for anything around it.
2. Decide whether it's a bug or a modeling error. It's a modeling error when a step does something the real code can't do, or sends a value the real component never sends. The first press sending `turn: 200` instead of the dial's rotation was one. Fix the model from the code, not from the result.
3. If it's real, confirm it with a browser test in `src/**/*.test.tsx` that drives the same steps, using the helpers in `src/__tests__/app.tsx`. Report it with the steps. Don't weaken a property or narrow the model to make it pass, and don't change product code unless asked.

## When the code changes on purpose

- **A new input or event:** add it to `KEYS` or the finger steps in `actions.ts`. If it finishes a choice, also add its event type to `FINISHING` in `motion.verify.ts`.
- **A new motion state:** decide whether it runs on its own. If it does, add it to `AUTONOMOUS` in `motion.verify.ts`. If it can commit on its own, add it to `RUNS` in `take.ts` and to the frame/pause rule in property 2. If the page drives it with a timer, add an action that's enabled exactly when the clock would fire.
- **A change to the store's landing loop, `useLinkedDial`, the clocks, or a TanStack upgrade:** update `deliver`, `load`, `back` or `actions()`, and the coverage table row. Re-read `commitLocation` in `@tanstack/router-core` after any router upgrade.
- **A promise that changes on purpose:** edit the property's wording and check. Cite the commit, test or doc that says it changed, and record the old and new wording here.

After any update, check that the check can still fail. Break the guarded code in a scratch edit, confirm that `pnpm verify` names the right property, then restore the file with `git checkout -- <file>`. These are the breaks it's known to catch:

| Scratch edit in `motion.ts`                         | Property that fails |
| --------------------------------------------------- | ------------------- |
| `aim` returns `land(event.hue)`                     | 1                   |
| `step` during `coasting` commits but keeps `motion` | 2                   |
| `land` sets `motion: { kind: 'idle' }`              | 3                   |
| `AUTONOMOUS` drops `'scrolling'`                    | 4 (and 2)           |
| `AUTONOMOUS` drops `'landing'`                      | 4                   |
| `release` from the edge returns `{ motion }`        | 5                   |

For drift that piled up across commits that skipped this skill, use `/maintain-formal-verification-skill`.
