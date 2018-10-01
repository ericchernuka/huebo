import React from 'react'
import { withRouter } from 'react-router-dom'

class GATracker extends React.Component {
  componentDidMount() {
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
    if (typeof window.ga === 'function') {
      const { location } = this.props
      window.ga('set', 'page', location.pathname + location.search)
      window.ga('send', 'pageview')
    }
  }

  render() {
    return null
  }
}

export default withRouter(GATracker)
