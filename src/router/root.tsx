import {
  Navigate,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Announcer } from '../shared/announcer'
import { DEFAULT_HUE } from '../picker/color'
import type { Analytics } from '../shared/analytics'

export const rootRoute = createRootRouteWithContext<{ analytics: Analytics }>()(
  {
    component: () => (
      <Announcer>
        <Outlet />
      </Announcer>
    ),
    notFoundComponent: () => (
      <Navigate
        params={{ hue: DEFAULT_HUE, pick: null }}
        replace
        to="/$hue/{-$saturation}/{-$brightness}"
      />
    ),
  },
)
