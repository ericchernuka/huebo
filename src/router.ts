import {
  createBrowserHistory,
  createRouter,
  type RouterHistory,
} from '@tanstack/react-router'
import { pickerRoute } from './picker/route'
import { rootRoute } from './root-route'
import type { Analytics } from './shared/analytics'

export function createAppRouter(analytics: Analytics, history?: RouterHistory) {
  return createRouter({
    context: { analytics },
    notFoundMode: 'root',
    routeTree: rootRoute.addChildren([pickerRoute]),
    history: history ?? createBrowserHistory(),
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
