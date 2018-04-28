import React from 'react'

const updateDocumentTitle = title => (document.title = `${title} | Huebo`)

export default class DocumentTitle extends React.Component {
  componentDidMount() {
    updateDocumentTitle(this.props.title)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.title !== prevProps.title) {
      updateDocumentTitle(this.props.title)
    }
  }

  render() {
    return this.props.children
  }
}
