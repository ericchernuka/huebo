import React from 'react'
import {
  BrowserRouter as Router,
  Redirect,
  Switch,
  Route,
} from 'react-router-dom'
import Huebo from './Huebo'
import { DEFAULT_HUE } from '../constants'

const App = () => (
  <Switch>
    <Route
      path="/:hue(\d+)/:saturation(\d+)?/:brightness(\d+)?"
      render={routeProps => {
        const { match } = routeProps
        if (
          (match.params.hue && !match.params.saturation) ||
          (match.params.saturation && match.params.brightness)
        ) {
          return <Huebo {...routeProps} />
        }
        return <Redirect to={`/${match.params.hue}`} />
      }}
    />
    <Redirect to={`/${DEFAULT_HUE}`} />
  </Switch>
)

export default App
