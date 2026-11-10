# The dial's motion is a pure reducer behind a store

Every input that moves the hue (keys, ring, mouse wheel, touch, coast, stepper, picks, Back) goes through one pure `transition(motion, event, shown)` in `src/picker/hue-dial/motion.ts`. A small store in `dial-motion.ts` owns the clocks, and components read it with `useSyncExternalStore`. Before this, the motion was spread across component state, refs and effects, and inputs could fight. A coast could land after a pick and overwrite it, and Back didn't stop a scroll that was waiting to commit.

Keeping the reducer pure makes every order of events testable in Node. It also makes the exhaustive check in ADR-0003 possible. The cost is that every new input has to be designed as an event, not added straight into a component.
