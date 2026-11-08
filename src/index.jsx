import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom';
import App from './components/App';
import { initializeAnalytics } from './analytics'
import registerServiceWorker from './registerServiceWorker';

initializeAnalytics(import.meta.env.REACT_APP_GOOGLE_ANALYTICS_ID)

createRoot(document.getElementById('root')).render(
  <Router>
    <App />
  </Router>,
)
registerServiceWorker()
