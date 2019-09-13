import React from 'react'
import { render } from 'react-dom'
import { App } from './components/App'

export const appVersion = 'v2019.09.12'
export const apiPrefix = 'https://rizadh.com/route-planner/'

// tslint:disable-next-line:no-var-requires
require('babel-polyfill')

mapkit.init({
    authorizationCallback: done =>
        fetch(apiPrefix + 'token')
            .then(res => res.text())
            .then(done),
})

render(<App />, document.getElementById('root'))
