import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { DEFAULT_HUE } from '../constants'
import { HUE_PATHS } from '../routes'
import GoogleAnalytics from '../analytics/GoogleAnalytics'
import Huebo from './Huebo'

const App = () => (
  <React.Fragment>
    <GoogleAnalytics />
    <Switch>
      <Route
        exact
        path={HUE_PATHS}
        render={routeProps => <Huebo {...routeProps} />}
      />
      <Redirect to={`/${DEFAULT_HUE}`} />
    </Switch>
  </React.Fragment>
)

export default App
