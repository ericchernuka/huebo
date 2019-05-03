import copy from 'copy-to-clipboard'
import React from 'react'
import { extractHSBValuesFromParams } from '../utils'
import { hsb2Hex } from '../utils/color_utils'
import ColorOutputs from './ColorOutputs'
import DocumentTitle from './DocumentTitle'
import HueSelector from './HueSelector'
import SwatchGrid from './SwatchGrid'

class Huebo extends React.Component {
  state = {
    draggingHue: Number(this.props.match.params.hue),
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

  handleHueChange = hue =>
    this.setState({ draggingHue: hue, copiedColorFormat: null })

  handleDrag = ({ isDragging = false }) => {
    this.setState({ isDragging })
  }

  syncUrlWithHueSelection = hue => {
    const { match } = this.props
    const { saturation, brightness } = extractHSBValuesFromParams(match.params)
    this.props.history.push(
      `/${hue}${brightness ? `/${saturation}/${brightness}` : ''}`,
    )
  }

  componentDidUpdate(_, prevState) {
    if (prevState.isDragging && !this.state.isDragging) {
      this.syncUrlWithHueSelection(this.state.draggingHue)
    }
  }

  render() {
    const { copiedColorFormat, draggingHue, isDragging } = this.state
    const { hue: urlHue, saturation, brightness } = extractHSBValuesFromParams(
      this.props.match.params,
    )

    const documentTitle = brightness
      ? `HSB(${urlHue},${saturation},${brightness})`
      : `Hue: ${urlHue}`

    const hue = isDragging ? draggingHue : urlHue

    const hex =
      saturation && brightness ? hsb2Hex(hue, saturation, brightness) : null

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
                  onDrag={this.handleDrag}
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

export default Huebo
