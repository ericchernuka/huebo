import { use, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AnalyticsContext } from './AnalyticsContext'
import { describeLocation } from './describeLocation'

const GoogleAnalytics = () => {
  const analytics = use(AnalyticsContext)
  const { pathname } = useLocation()

  useEffect(() => {
    const location = describeLocation(pathname)

    if (location) {
      analytics.trackPageView(location)
    }
  }, [analytics, pathname])

  return null
}

export default GoogleAnalytics
