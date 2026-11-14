import type { BrowserCommand } from 'vitest/node'

type RingPointer = 'down' | 'move' | 'up'

const RING_RADIUS = 0.43

// Synthetic PointerEvents can't take pointer capture, which the ring needs, so
// this drives Playwright's real mouse from the Node side.
const ringPointer: BrowserCommand<
  [action: RingPointer, degrees: number]
> = async (context, action, degrees) => {
  if (context.provider.name !== 'playwright') {
    throw new Error('ringPointer needs the Playwright provider.')
  }

  const ring = context.iframe.getByRole('slider', { name: 'Hue' })
  const box = await ring.boundingBox()

  if (!box) {
    throw new Error('The ring is not on screen.')
  }

  const radians = (degrees * Math.PI) / 180
  const radius = box.width * RING_RADIUS
  const { mouse } = context.page

  await mouse.move(
    box.x + box.width / 2 + Math.sin(radians) * radius,
    box.y + box.height / 2 - Math.cos(radians) * radius,
  )

  if (action === 'down') {
    await mouse.down()
  } else if (action === 'up') {
    await mouse.up()
  }
}

export const commands = { ringPointer }

declare module 'vitest/browser' {
  interface BrowserCommands {
    ringPointer: (action: RingPointer, degrees: number) => Promise<void>
  }
}
