import { RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import ReactGA from 'react-ga4';
import './index.css';
import { router } from './router/router';

// Initialize Google Analytics before rendering
const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
if (gaId) {
  ReactGA.initialize(gaId);
}

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
);
