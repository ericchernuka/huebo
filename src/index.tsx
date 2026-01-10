import { createRoot } from 'react-dom/client';
import ReactGA from 'react-ga4';
import { BrowserRouter } from 'react-router';
import App from './components/App';
import './index.css';

// Initialize Google Analytics before rendering
const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
if (gaId) {
  ReactGA.initialize(gaId);
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
