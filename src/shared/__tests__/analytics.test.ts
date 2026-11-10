import { describe, expect, test } from 'vitest'
import { createAnalytics, type GaClient } from '../analytics'

function recordingGa() {
  const calls: Array<{ readonly method: string; readonly args: unknown }> = []

  const ga: GaClient = {
    initialize: (...args) => void calls.push({ args, method: 'initialize' }),
    send: (...args) => void calls.push({ args, method: 'send' }),
  }

  return { calls, ga }
}

const view = {
  page: '/:hue/:saturation/:brightness',
  params: { brightness: '75', hue: '200', saturation: '62' },
}

describe('createAnalytics', () => {
  test.each([undefined, '', 'UA-12345-1', 'g-lowercase'])(
    'given the measurement ID %j, when a page is viewed, then GA is never loaded',
    id => {
      const { calls, ga } = recordingGa()

      createAnalytics(id, ga).trackPageView(view)

      expect(calls).toEqual([])
    },
  )

  test('given a GA4 ID, then GA starts without its automatic page view', () => {
    const { calls, ga } = recordingGa()

    createAnalytics('G-TEST', ga)

    expect(calls).toEqual([
      {
        args: ['G-TEST', { gtagOptions: { send_page_view: false } }],
        method: 'initialize',
      },
    ])
  })

  test('given a GA4 ID, when a page is viewed, then GA gets the template and the colour', () => {
    const { calls, ga } = recordingGa()

    createAnalytics('G-TEST', ga).trackPageView(view)

    expect(calls.at(-1)).toEqual({
      args: [
        {
          brightness: '75',
          hitType: 'pageview',
          hue: '200',
          page: '/:hue/:saturation/:brightness',
          saturation: '62',
        },
      ],
      method: 'send',
    })
  })
})
