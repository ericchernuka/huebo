#!/usr/bin/env node
// Real wheel and touch input at page coordinates, through the CDP endpoint of
// the agent-browser session in $AGENT_BROWSER_SESSION. agent-browser's own
// `mouse wheel` always fires at (0, 0) and it has no timed touch swipe, so the
// ring's scroll and the phone wheel's flick need this.
//
//   input.mjs front             bring the tab to front, so it's visible and CSS transitions run
//   input.mjs wheel <x> <y> <deltaY> [notches=1] [gapMs=30]
//   input.mjs tap <x> <y>
//   input.mjs swipe <x1> <y> <x2> <durationMs> [steps=8]
//   input.mjs read-clipboard    prints what Copy wrote (agent-browser's clipboard read is denied)
//
// It drives the active tab whose URL starts with $URL.
import { execFileSync } from 'node:child_process'

const [command, ...args] = process.argv.slice(2)
const numbers = args.map(Number)

if (
  !['wheel', 'tap', 'swipe', 'read-clipboard', 'front'].includes(command) ||
  numbers.some(Number.isNaN)
) {
  console.error(
    'usage: input.mjs front | wheel <x> <y> <deltaY> [notches] [gapMs] | tap <x> <y> | swipe <x1> <y> <x2> <ms> [steps] | read-clipboard',
  )
  process.exit(2)
}

const agent = (...flags) =>
  execFileSync('agent-browser', flags, { encoding: 'utf8' })

const browserUrl = agent('get', 'cdp-url').trim()
const tabs = JSON.parse(agent('tab', 'list', '--json')).data.tabs
const tab = tabs.find(t => t.active && t.url.startsWith(process.env.URL ?? ''))

if (!tab) {
  console.error(`No active tab at ${process.env.URL}. Open the app first.`)
  process.exit(1)
}

const socket = new WebSocket(browserUrl)
const waiting = new Map()
let nextId = 1

socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  const settle = waiting.get(message.id)

  if (settle) {
    waiting.delete(message.id)
    settle(message)
  }
})

function call(method, params = {}, sessionId) {
  const id = nextId++

  socket.send(JSON.stringify({ id, method, params, sessionId }))

  return new Promise((resolve, reject) => {
    waiting.set(id, message =>
      message.error
        ? reject(new Error(`${method}: ${message.error.message}`))
        : resolve(message.result),
    )
  })
}

const sleep = ms => new Promise(done => setTimeout(done, ms))

await new Promise(open => socket.addEventListener('open', open, { once: true }))

const { sessionId } = await call('Target.attachToTarget', {
  flatten: true,
  targetId: tab.targetId,
})

const page = (method, params) => call(method, params, sessionId)

if (command === 'front') {
  await page('Page.bringToFront')
} else if (command === 'read-clipboard') {
  const { targetInfo } = await call('Target.getTargetInfo', {
    targetId: tab.targetId,
  })

  await call('Browser.grantPermissions', {
    browserContextId: targetInfo.browserContextId,
    origin: new URL(tab.url).origin,
    permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
  })

  const { exceptionDetails, result } = await page('Runtime.evaluate', {
    awaitPromise: true,
    expression: 'navigator.clipboard.readText()',
    userGesture: true,
  })

  if (exceptionDetails) {
    throw new Error(
      exceptionDetails.exception?.description ?? exceptionDetails.text,
    )
  }

  console.log(result.value)
} else if (command === 'wheel') {
  const [x, y, deltaY, notches = 1, gapMs = 30] = numbers

  for (let notch = 0; notch < notches; notch++) {
    await page('Input.dispatchMouseEvent', {
      deltaX: 0,
      deltaY,
      type: 'mouseWheel',
      x,
      y,
    })
    await sleep(gapMs)
  }
} else {
  await page('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 1,
  })

  const touch = (type, x, y) =>
    page('Input.dispatchTouchEvent', {
      touchPoints: type === 'touchEnd' ? [] : [{ id: 1, x, y }],
      type,
    })

  if (command === 'tap') {
    const [x, y] = numbers

    await touch('touchStart', x, y)
    await sleep(40)
    await touch('touchEnd', x, y)
  } else {
    const [x1, y, x2, durationMs, steps = 8] = numbers

    await touch('touchStart', x1, y)

    for (let step = 1; step <= steps; step++) {
      await sleep(durationMs / steps)
      await touch('touchMove', x1 + ((x2 - x1) * step) / steps, y)
    }

    await touch('touchEnd', x2, y)
  }
}

await call('Target.detachFromTarget', { sessionId })

socket.close()

if (command !== 'read-clipboard') {
  console.log(`✓ ${command} ${args.join(' ')}`)
}
