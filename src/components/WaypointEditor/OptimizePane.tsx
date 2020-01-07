import isMobileFn from 'ismobilejs'
import React, { useCallback, useContext } from 'react'
import { WaypointEditorTemplate } from '.'
import { AppStateContext } from '../../context/AppStateContext'
import { useCompactMode } from '../../hooks/useCompactMode'
import { useInputField } from '../../hooks/useInputField'
import { OptimizationParameter } from '../../redux/actionTypes'
import { Button } from '../Button'

export const OptimizePane = () => {
    const {
        state: { waypoints, optimizationInProgress },
        dispatch,
    } = useContext(AppStateContext)
    const compactMode = useCompactMode()

    const { value: startPointFieldValue, setValue: setStartPointFieldValue } = useInputField('', () => undefined)
    const { value: endPointFieldValue, setValue: setEndPointFieldValue } = useInputField('', () => undefined)

    const startPoint = (startPointFieldValue || endPointFieldValue).trim()
    const endPoint = (endPointFieldValue || startPointFieldValue).trim()

    const handleStartPointFieldChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => setStartPointFieldValue(e.currentTarget.value),
        [],
    )

    const handleEndPointFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEndPointFieldValue(e.currentTarget.value)
    }, [])

    const optimizeDistance = useCallback(
        () =>
            dispatch({
                type: 'OPTIMIZE_ROUTE',
                optimizationParameter: OptimizationParameter.Distance,
                startPoint,
                endPoint,
            }),
        [startPoint, endPoint],
    )

    const optimizeTime = useCallback(
        () =>
            dispatch({
                type: 'OPTIMIZE_ROUTE',
                optimizationParameter: OptimizationParameter.Time,
                startPoint,
                endPoint,
            }),
        [startPoint, endPoint],
    )

    const cancelOptimize = useCallback(
        () =>
            dispatch({
                type: 'OPTIMIZE_ROUTE_CANCEL',
                startPoint,
                endPoint,
            }),
        [startPoint, endPoint],
    )

    const insufficientWaypoints = waypoints.length < 3

    const defaultStartPoint = () => startPoint || waypoints[0].address
    const defaultEndPoint = () => endPoint || waypoints[waypoints.length - 1].address

    const isMobileDevice = isMobileFn().any

    const body = insufficientWaypoints ? (
        <div className="text text-warning" role="alert">
            Add three or more waypoints to optimize routes
        </div>
    ) : (
        <>
            <div className="text text-secondary" role="alert">
                Optimal route from start point to end point through all waypoints will be found
            </div>
            <div className="text text-secondary" role="alert">
                If left unspecified, route will be found from first to last waypoint
            </div>
            <div className="input-row">
                <input
                    type="text"
                    placeholder={`Start Point (${defaultStartPoint()})`}
                    value={startPointFieldValue}
                    onChange={handleStartPointFieldChange}
                    disabled={optimizationInProgress}
                    autoFocus={!isMobileDevice}
                />
            </div>
            <div className="input-row">
                <input
                    type="text"
                    placeholder={`End Point (${defaultEndPoint()})`}
                    value={endPointFieldValue}
                    onChange={handleEndPointFieldChange}
                    disabled={optimizationInProgress}
                />
            </div>
        </>
    )

    const footer = optimizationInProgress ? (
        <>
            <Button type="primary" disabled={true}>
                <i className="fas fa-fw fa-spin fa-circle-notch" />
                {!compactMode && ' Optimizing'}
            </Button>
            <Button type="danger" onClick={cancelOptimize}>
                <i className="fas fa-ban" /> Cancel
            </Button>
        </>
    ) : (
        <>
            <Button type="primary" onClick={optimizeDistance} disabled={insufficientWaypoints}>
                <i className="fas fa-fw fa-ruler-combined" />
                {compactMode ? ' Distance' : ' Optimize Distance'}
            </Button>
            <Button type="primary" onClick={optimizeTime} disabled={insufficientWaypoints}>
                <i className="fas fa-fw fa-clock" />
                {compactMode ? ' Time' : ' Optimize Time'}
            </Button>
        </>
    )

    return <WaypointEditorTemplate body={body} footer={footer} />
}
