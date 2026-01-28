import { createRouter } from '@tanstack/react-router';
import { GoogleAnalytics } from '../components/GoogleAnalytics.tsx';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
  defaultPreload: 'intent',
  InnerWrap: ({ children }) => (
    <>
      <GoogleAnalytics />
      {children}
    </>
  ),
  routeTree,
});

// Type registration for TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
