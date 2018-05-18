import copy from 'copy-to-clipboard'
import React from 'react'
import { debounce } from '../utils'
import { hsb2Hex } from '../utils/color_utils'
import ColorOutputs from './ColorOutputs'
import DocumentTitle from './DocumentTitle'
import HueSelector from './HueSelector'
import SwatchGrid from './SwatchGrid'

export default class Huebo extends React.Component {
  state = {
    hue: parseInt(this.props.match.params.hue, 10),
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

  handleHueChange = hue => this.setState({ hue, copiedColorFormat: null })

  syncUrlWithHueSelection = debounce(hue => {
    const { match } = this.props
    const { saturation, brightness } = this.parsedUrlParams(match.params)
    this.props.history.push(
      `/${hue}${brightness ? `/${saturation}/${brightness}` : ''}`,
    )
  }, 600)

  parsedUrlParams = params =>
    Object.keys(params).reduce((acc, key) => {
      acc[key] = parseInt(params[key], 10) || null
      return acc
    }, {})

  render() {
    const { match } = this.props
    const { copiedColorFormat, hue } = this.state
    const { saturation, brightness } = this.parsedUrlParams(match.params)
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
                <HueSelector
                  hue={hue}
                  onChange={this.handleHueChange}
                  onAfterChange={this.syncUrlWithHueSelection}
                />
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
