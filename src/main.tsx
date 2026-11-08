import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import { createAppRouter } from './router'
import { createAnalytics } from './shared/analytics'

const root = document.querySelector('#root')

if (root) {
  const router = createAppRouter(
    createAnalytics(import.meta.env.VITE_GOOGLE_ANALYTICS_ID),
  )

  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
