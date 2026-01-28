import { RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import ReactGA from 'react-ga4';
import './index.css';
import { router } from './router/router';

const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

if (gaId) {
  ReactGA.initialize(gaId);
}

function App() {
  return <RouterProvider router={router} />;
}

// Remove any existing title tags to prevent issues with React 19
const existingTitleTag = document.querySelector('title');
if (existingTitleTag) {
  existingTitleTag.remove();
}

createRoot(document.getElementById('root')!).render(<App />);
