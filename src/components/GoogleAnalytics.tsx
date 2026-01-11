import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';

export default function GoogleAnalytics() {
  const router = useRouter();

  useEffect(
    () =>
      router.subscribe('onResolved', ({ pathChanged, toLocation }) => {
        if (!pathChanged) {
          return;
        }

        ReactGA.send({
          hitType: 'pageview',
          page: toLocation.pathname,
        });
      }),
    [router],
  );

  return null;
}
