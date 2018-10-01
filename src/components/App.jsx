import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { DEFAULT_HUE, INCREMENTS } from '../constants'
import GATracker from './GATracker'
import Huebo from './Huebo'

const incrementOptions = INCREMENTS.join('|')
const hueRange = '[0-2]?[0-9]?[0-9]|3[0-4][0-9]|35[0-5]'
// TODO: Make the saturation/brightness contingent on each other to avoid having
// to check the route properties
const huePath = `/:hue(${hueRange})/:saturation(${incrementOptions})?/:brightness(${incrementOptions})?`

const App = () => (
  <React.Fragment>
    <GATracker />
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
  </React.Fragment>
)

export default App
