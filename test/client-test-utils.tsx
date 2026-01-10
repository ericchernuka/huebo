import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';

interface Options extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

export function renderWithRouter(
  ui: ReactElement,
  { route = '/', ...options }: Options = {},
) {
  return render(
    <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>,
    options,
  );
}
