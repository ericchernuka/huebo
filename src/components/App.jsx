import React from 'react'
import { Redirect, Switch, Route } from 'react-router-dom'
import Huebo from './Huebo'
import { DEFAULT_HUE, INCREMENTS } from '../constants'

const incrementOptions = INCREMENTS.join('|')
const hueRange = '[0-2]?[0-9]?[0-9]|3[0-4][0-9]|35[0-5]'
// TODO: Make the saturation/brightness contingent on each other to avoid having
// to check the route properties
const huePath = `/:hue(${hueRange})/:saturation(${incrementOptions})?/:brightness(${incrementOptions})?`

const App = () => (
  <Switch>
    <Route
      path={huePath}
      exact
      render={routeProps => {
        const { saturation, brightness } = routeProps.match.params
        if (saturation && !brightness) {
          return <Redirect to={`/${DEFAULT_HUE}`} />
        }
        return <Huebo {...routeProps} />
      }}
    />
    <Redirect to={`/${DEFAULT_HUE}`} />
  </Switch>
)

export default App
