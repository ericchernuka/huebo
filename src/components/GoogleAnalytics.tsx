import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { useLocation } from 'react-router';

export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname + location.search,
    });
  }, [location]);

  return null;
}
