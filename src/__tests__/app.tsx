import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { expect } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'
import '../global.css'
import { createAppRouter } from '../router'
import type { PageView } from '../shared/analytics'

export async function openAt(
  path: string,
  [width, height]: readonly [number, number] = [1280, 900],
) {
  const views: Array<PageView> = []
  const history = createMemoryHistory({ initialEntries: [path] })

  const router = createAppRouter(
    { trackPageView: view => views.push(view) },
    history,
  )

  await page.viewport(width, height)
  const screen = await render(<RouterProvider router={router} />)

  return { history, screen, views }
}

export const square = (saturation: number, brightness: number) =>
  page.getByRole('button', {
    name: new RegExp(`^Saturation ${saturation}, brightness ${brightness},`),
  })

export const picked = () => page.getByRole('gridcell', { selected: true })
export const hueSlider = () => page.getByRole('slider', { name: 'Hue' })

export async function expectPath(
  history: { location: { pathname: string } },
  path: string,
) {
  await expect.poll(() => history.location.pathname).toBe(path)
}

export const PHONE = [390, 844] as const
