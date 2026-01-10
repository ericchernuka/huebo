import { useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';

export default function GoogleAnalytics() {
  const routerState = useRouterState();
  const { pathname, searchStr } = routerState.location;

  useEffect(() => {
    ReactGA.send({
      hitType: 'pageview',
      page: pathname + searchStr,
    });
  }, [pathname, searchStr]);

  return null;
}
