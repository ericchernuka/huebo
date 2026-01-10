import { useEffect } from 'react';
import ReactGA4 from 'react-ga4';
import { useLocation } from 'react-router';

const ReactGA = ReactGA4.default;

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
