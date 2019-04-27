import copy from 'copy-to-clipboard'
import React from 'react'
import { hsb2Hex } from '../utils/color_utils'
import ColorOutputs from './ColorOutputs'
import DocumentTitle from './DocumentTitle'
import HueSelector from './HueSelector'
import SwatchGrid from './SwatchGrid'

export default class Huebo extends React.Component {
  state = {
    hue: Number(this.props.match.params.hue),
    isDragging: false,
    copiedColorFormat: null,
  }

  handleCopy = format => {
    copy(format)
    this.setState({ copiedColorFormat: format }, this.handleCopyClear)
  }

  handleCopyClear = () => {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.setState({ copiedColorFormat: null })
    }, 2000)
  }

  handleHueChange = (hue, { isDragging }) =>
    this.setState({ hue, copiedColorFormat: null, isDragging })

  syncUrlWithHueSelection = hue => {
    const { match } = this.props
    const { saturation, brightness } = this.parsedUrlParams(match.params)
    this.props.history.push(
      `/${hue}${brightness ? `/${saturation}/${brightness}` : ''}`,
    )
  }

  componentDidUpdate(_, prevState) {
    if (prevState.isDragging && !this.state.isDragging) {
      this.syncUrlWithHueSelection(this.state.hue)
    }
  }

  parsedUrlParams = params =>
    Object.keys(params).reduce((acc, key) => {
      acc[key] = params[key] ? parseInt(params[key], 10) : null
      return acc
    }, {})

  render() {
    const { match } = this.props
    const { copiedColorFormat, hue: stateHue, isDragging } = this.state
    const { hue: urlHue, saturation, brightness } = this.parsedUrlParams(
      match.params,
    )

    const hue = isDragging ? stateHue : urlHue

    const hex =
      saturation && brightness ? hsb2Hex(hue, saturation, brightness) : null

    const documentTitle = brightness
      ? `HSB(${hue},${saturation},${brightness})`
      : `Hue: ${hue}`

    return (
      <DocumentTitle title={documentTitle}>
        <div
          className="app-container"
          style={{ backgroundColor: hsb2Hex(hue, 12, 88) }}
        >
          <div className="huebo">
            <div className="huebo-layout">
              <div className="hue-manager">
                <HueSelector hue={hue} onChange={this.handleHueChange} />
                <ColorOutputs
                  hue={hue}
                  hex={hex}
                  saturation={saturation}
                  brightness={brightness}
                  copiedColorFormat={copiedColorFormat}
                  onCopy={this.handleCopy}
                />
              </div>
              <SwatchGrid hue={hue} selectedHex={hex} />
            </div>
          </div>
        </div>
      </DocumentTitle>
    )
  }
}
