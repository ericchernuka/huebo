import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './components/App'
import { createAnalytics } from './analytics/createAnalytics'
import { AnalyticsContext } from './analytics/AnalyticsContext'
import registerServiceWorker from './registerServiceWorker'

const analytics = createAnalytics(import.meta.env.VITE_GOOGLE_ANALYTICS_ID)

createRoot(document.getElementById('root')).render(
  <AnalyticsContext value={analytics}>
    <Router>
      <App />
    </Router>
  </AnalyticsContext>,
)
registerServiceWorker()
