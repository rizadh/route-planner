import { Line } from 'rc-progress'
import React, { useContext, useMemo } from 'react'
import { AppStateContext } from '../context/AppStateContext'
import { useDarkMode } from '../hooks/useDarkMode'
import { routeInformation } from '../redux/selectors'

export const ProgressBar = () => {
    const darkMode = useDarkMode()
    const { state } = useContext(AppStateContext)
    const currentRouteInformation = useMemo(() => routeInformation(state), [state])

    if (currentRouteInformation.status === 'FETCHING') {
        return (
            <div id="progress-bar">
                <Line
                    percent={currentRouteInformation.progress * 100}
                    trailColor={darkMode ? 'rgba(10, 132, 255, 0.2)' : 'rgb(0, 122, 255, 0.2)'}
                    strokeColor={darkMode ? 'rgb(10, 132, 255)' : 'rgb(0, 122, 255)'}
                    strokeLinecap="butt"
                />
            </div>
        )
    }

    return null
}
