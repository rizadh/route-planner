import React from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import styled from 'styled-components'
import { useCompactMode } from '../hooks/useCompactMode'
import { routeInformation } from '../redux/selectors'
import { AppState } from '../redux/state'
import { StatView } from './StatView'

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: var(--standard-margin);

    border-top: var(--standard-border);
`

export const InfoBar = () => {
    const compactMode = useCompactMode()
    const currentRouteInformation = useSelector(routeInformation, shallowEqual)
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)
    const showCondensedText = editorIsHidden && compactMode

    let statusbarItems: JSX.Element | string
    switch (currentRouteInformation.status) {
        case 'FETCHING':
            statusbarItems = (
                <StatView title="Routing" value={stringForUpdateProgress(currentRouteInformation.progress)} />
            )
            break
        case 'FETCHED':
            statusbarItems = (
                <>
                    <StatView title="Distance" value={stringForDistance(currentRouteInformation.totalDistance)} />
                    <StatView title="Time" value={stringForTime(currentRouteInformation.totalTime)} />
                </>
            )
            break
        case 'FAILED':
            statusbarItems = 'Routing failed'
            break
        case 'NO_ROUTE':
            statusbarItems = 'Enter more waypoints'
            break
        default:
            throw new Error('Invalid route information')
    }

    return <Container>{showCondensedText ? 'Editor' : statusbarItems}</Container>
}

InfoBar.Container = Container

function stringForTime(seconds: number) {
    if (seconds < 60) {
        return `${Math.floor(seconds)} s`
    }

    if (seconds < 3600) {
        return `${Math.floor(seconds / 60)} min`
    }

    return `${Math.floor(seconds / 3600)} h ${Math.floor((seconds / 60) % 60)} m`
}

function stringForDistance(metres: number) {
    if (metres < 1000) {
        return `${Math.floor(metres)} metres`
    }

    return `${Math.floor(metres / 100) / 10} km`
}

function stringForUpdateProgress(progress: number): string {
    return `${Math.floor(progress * 1000) / 10} %`
}
