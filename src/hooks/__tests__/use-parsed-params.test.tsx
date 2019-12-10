import { renderHook } from '@testing-library/react-hooks';
import React, { ReactNode } from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import useParsedParams from '../use-parsed-params';

describe('useParsedParams', () => {
  it('returns an empty object if an empty types object is passed in', () => {
    const { result } = renderHook(() => useParsedParams<{}>({}), {
      wrapper: ({ children }) => setupRouter(children, { initialEntry: '/' }),
    });

    expect(result.current).toEqual({});
  });

  it('correctly parses booleans', () => {
    const { result } = renderHook(
      () =>
        useParsedParams<{ includeSent: boolean }>({
          includeSent: 'boolean',
        }),
      {
        wrapper: ({ children }) =>
          setupRouter(children, {
            initialEntry: '/inbox/include-sent/:includeSent/',
            currentRoute: '/inbox/include-sent/true',
          }),
      },
    );

    const { includeSent } = result.current;

    expect(typeof includeSent).toBe('boolean');
    expect(includeSent).toBe(true);
  });

  it('correctly parses dates', () => {
    const { result } = renderHook(
      () => useParsedParams<{ date: boolean }>({ date: 'date' }),
      {
        wrapper: ({ children }) =>
          setupRouter(children, {
            initialEntry: '/calendar/:date/',
            currentRoute: '/calendar/2019-01-01',
          }),
      },
    );

    const { date } = result.current;

    expect(date).toBeInstanceOf(Date);
    expect(date).toEqual(new Date('2019-01-01'));
  });

  it('correctly parses numbers', () => {
    const { result } = renderHook(
      () => useParsedParams<{ page: number }>({ page: 'number' }),
      {
        wrapper: ({ children }) =>
          setupRouter(children, {
            initialEntry: '/feed/:page',
            currentRoute: '/feed/100',
          }),
      },
    );

    const { page } = result.current;

    expect(typeof page).toBe('number');
    expect(page).toEqual(100);
  });

  it('does not parse keys that are not in the provided types dictionary', () => {
    const { result } = renderHook(
      () => useParsedParams<{ page: number }>({ page: 'number' }),
      {
        wrapper: ({ children }) =>
          setupRouter(children, {
            initialEntry: '/feed/:date/:page',
            currentRoute: '/feed/2019-01-01/1',
          }),
      },
    );

    expect(result.current).toMatchObject({
      page: 1,
      date: '2019-01-01',
    });
  });

  it('throws an error when an invalid type is passed in', () => {
    const { result } = renderHook(
      //@ts-ignore
      () => useParsedParams({ dateRange: 'range' }),
      {
        wrapper: ({ children }) =>
          setupRouter(children, {
            initialEntry: '/feed/:dateRange',
            currentRoute: '/feed/20190101-20190105',
          }),
      },
    );

    expect(result.error).toMatchInlineSnapshot(
      `[Error: Unsupported data type]`,
    );
  });
});

const setupRouter = (
  children: ReactNode,
  { initialEntry = '/', currentRoute = '/' },
) => (
  <MemoryRouter initialEntries={[currentRoute]}>
    <Route path={initialEntry}>{children}</Route>
  </MemoryRouter>
);
