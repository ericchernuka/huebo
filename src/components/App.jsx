import React from 'react'
import PropTypes from 'prop-types'
import { Block, Col, Flex, InlineBlock } from 'jsxstyle'
import {
  BrowserRouter as Router,
  Link,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom'
import { hslString } from '../utils/color'
import ColorOutputs from './ColorOutputs'
import HueRow from './HueRow'
import HueSelector from './HueSelector'

class ColorPikApp extends React.Component {
  state = {
    hue: 60,
    hsbSelection: null,
    copiedColorFormat: null
  }

  componentWillMount() {
    this.parseHueFromUrl(this.props.match)
  }

  parseHueFromUrl(match) {
    let { hue } = match.params
    hue = parseInt(hue, 10)

    if (!isNaN(hue)) {
      this.setState(() => ({ hue }))
    }
  }

  handleCopy = (format) => () => {
    this.setState({
      copiedColorFormat: format
    }, () => {
      clearTimeout(this.timeout)

      this.timeout = setTimeout(() => {
        this.setState({ copiedColorFormat: null })
      }, 2000);
    })
  }

  handleHueChange = (e) => {
    const { value } = e.target
    const hue = parseInt(value, 10)
    this.setState({ hue, hsbSelection: null })
  }

  handleSwatchSelection = ({ hue, saturation, brightness }) => {
    this.setState({
      hsbSelection: { hue, saturation, brightness }
    })
  }

  handleUrlUpdate = () => {
    const { hue } = this.state
    this.props.history.push(`/${hue}`)
  }

  render() {
    const { match: { params } } = this.props

    const {
      copiedColorFormat,
      hue,
      hsbSelection,
    } = this.state

    return (
      <Flex
        justifyContent='center'
        height='100vh'
        transition='background-color 500ms ease-in-out'
        style={{ backgroundColor: hslString(hue, 12, 88) }}
      >
        <Block
          width={800}
          height={400}
          marginTop='2vh'
          boxShadow='0 4px 20px 0 rgba(0,0,0,0.05)'
        >
          <Flex>
            <Col flex={1}>
              <HueRow
                rowIndex={0}
                hue={hue}
                brightness={12}
                onSelect={this.handleSwatchSelection}
                selection={hsbSelection}
              />
              <HueRow
                rowIndex={1}
                hue={hue}
                brightness={25}
                onSelect={this.handleSwatchSelection}
                selection={hsbSelection}
              />
              <HueRow
                rowIndex={2}
                hue={hue}
                brightness={38}
                onSelect={this.handleSwatchSelection}
                selection={hsbSelection}
              />
              <HueRow
                rowIndex={3}
                hue={hue}
                brightness={50}
                onSelect={this.handleSwatchSelection}
                selection={hsbSelection}
              />
              <HueRow
                rowIndex={4}
                hue={hue}
                brightness={62}
                onSelect={this.handleSwatchSelection}
                selection={hsbSelection}
              />
              <HueRow
                rowIndex={5}
                hue={hue}
                brightness={75}
                onSelect={this.handleSwatchSelection}
                selection={hsbSelection}
              />
              <HueRow
                rowIndex={6}
                hue={hue}
                brightness={88}
                onSelect={this.handleSwatchSelection}
                selection={hsbSelection}
              />
              <HueRow
                rowIndex={7}
                hue={hue}
                brightness={100}
                onSelect={this.handleSwatchSelection}
                selection={hsbSelection}
              />
            </Col>
            <Col
              flex={1}
              justifyContent='space-between'
              padding={32}
              backgroundColor='#FFF'
              borderTopRightRadius={16}
              borderBottomRightRadius={16}
            >
              <HueSelector
                hue={hue}
                onChange={this.handleHueChange}
                onBlur={this.handleUrlUpdate}
              />
              <ColorOutputs
                {...hsbSelection}
                copiedColorFormat={copiedColorFormat}
                onCopy={this.handleCopy}
              />
            </Col>
          </Flex>
          <Flex justifyContent="center">
            <InlineBlock
              component={Link}
              props={{ to: '/', replace: true }}
              backgroundColor="white"
              borderRadius={3}
              textAlign="center"
              whiteSpace="noWrap"
              verticalAlign="middle"
              userSelect="none"
              border="1px solid #999"
              padding={8}
              marginTop={10}
              hoverBackgroundColor="rgb(225,225,225)"
              hoverBorderColor="#999"
            >
              Random Hue
            </InlineBlock>
          </Flex>
        </Block>
      </Flex>
    )
  }
}

class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/:hue" component={ColorPikApp} />
          <Route render={() => {
            let randomHue = Math.floor(Math.random() * (360 - 0 + 1))
            randomHue = Math.round(randomHue / 5) * 5
            return <Redirect to={`/${randomHue}`} />
          }} />
        </Switch>
      </Router>
    )
  }
}

export default App