import React from 'react'
import { initialize, pageview } from 'react-ga'
import { withRouter } from 'react-router-dom'

class GoogleAnalytics extends React.Component {
  componentDidMount() {
    initialize(import.meta.env.REACT_APP_GOOGLE_ANALYTICS_ID)
    this.trackPage()
  }

  componentDidUpdate(prevProps) {
    const currentPage = prevProps.location.pathname + prevProps.location.search
    const nextPage = this.props.location.pathname + this.props.location.search

    if (currentPage !== nextPage) {
      this.trackPage()
    }
  }

  trackPage = () => {
    const { location } = this.props
    pageview(`${location.pathname}${location.search}`)
  }

  render() {
    return null
  }
}

export default withRouter(GoogleAnalytics)
