import { createContext } from 'react'
import { noopAnalytics } from './createAnalytics'

export const AnalyticsContext = createContext(noopAnalytics)
