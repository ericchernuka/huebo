function gtag() {
  window.dataLayer.push(arguments)
}

export function initializeAnalytics(measurementId) {
  if (!measurementId?.startsWith('G-')) {
    return
  }

  window.dataLayer = window.dataLayer || []
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  document.head.append(script)
  gtag('js', new Date())
  gtag('config', measurementId)
}
