import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { routeTree } from '../src/router/routeTree.gen';

interface Options extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

export function renderWithRouter(
  ui: ReactElement,
  { route = '/', ...options }: Options = {},
) {
  const memoryHistory = createMemoryHistory({
    initialEntries: [route],
  });

  const router = createRouter({
    history: memoryHistory,
    routeTree,
  });

  return render(<RouterProvider router={router} />, options);
}
