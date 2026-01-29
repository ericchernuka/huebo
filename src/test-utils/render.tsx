import { RouterProvider } from '@tanstack/react-router';
import { render as rtlRender } from '@testing-library/react';
import { ReactElement } from 'react';
import { createTestRouter } from './router';

/**
 * Custom render with router context
 */
export function renderWithRouter(
  ui: ReactElement,
  options: {
    path?: string;
    search?: Record<string, unknown>;
  } = {},
) {
  const router = createTestRouter(options);

  return {
    ...rtlRender(<RouterProvider router={router} />),
    router,
  };
}
