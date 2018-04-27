import React from 'react'
import { Redirect, Switch, Route } from 'react-router-dom'
import Huebo from './Huebo'
import { DEFAULT_HUE, INCREMENTS } from '../constants'

const incrementOptions = INCREMENTS.join('|')
const huePath = `/:hue(\\d+)?/:saturation(${incrementOptions})?/:brightness(${incrementOptions})?`

const App = () => (
  <Switch>
    <Route path={huePath} exact component={Huebo} />
    <Redirect to="/" />
  </Switch>
)

export default App
