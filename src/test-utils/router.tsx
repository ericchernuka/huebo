import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

/**
 * Creates a test router with mocked search params
 */
export function createTestRouter(
  options: {
    path?: string;
    search?: Record<string, unknown>;
  } = {},
) {
  const { path = '/', search = {} } = options;

  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
  });

  const routeTree = rootRoute.addChildren([indexRoute]);

  const searchString = new URLSearchParams(
    Object.entries(search).map(([key, value]) => [key, String(value)]),
  ).toString();

  const history = createMemoryHistory({
    initialEntries: [searchString ? `${path}?${searchString}` : path],
  });

  return createRouter({
    history,
    routeTree,
  });
}
