import { saveAs } from 'file-saver'
import isMobileFn from 'ismobilejs'
import React, { useCallback, useContext, useMemo } from 'react'
import { WaypointEditorTemplate } from '.'
import { apiPrefix } from '../..'
import { AppStateContext } from '../../context/AppStateContext'
import { useCompactMode } from '../../hooks/useCompactMode'
import { useInputField } from '../../hooks/useInputField'
import { routeInformation } from '../../redux/selectors'
import { createWaypointFromAddress } from '../../redux/util'
import { isValidAddress } from '../../redux/validator'
import { preventFocus } from '../util/preventFocus'
import { WaypointList } from '../WaypointList'

export const WaypointsPane = () => {
    const {
        value: newWaypointFieldValue,
        setValue: setNewWaypointFieldValue,
        changeHandler: handleNewWaypointFieldChange,
        keyPressHandler: handleNewWaypointFieldKeyPress,
    } = useInputField('', () => isValidAddress(newWaypointFieldValue) && addNewWaypoint())

    const { state, dispatch } = useContext(AppStateContext)
    const compactMode = useCompactMode()
    const {
        waypoints: { list: waypoints },
    } = state

    const currentRouteInformation = useMemo(() => routeInformation(state), [state])

    const reverseWaypoints = useCallback(() => dispatch({ type: 'REVERSE_WAYPOINTS' }), [])
    const addNewWaypoint = useCallback(() => {
        dispatch({ type: 'ADD_WAYPOINT', waypoint: createWaypointFromAddress(newWaypointFieldValue) })
        setNewWaypointFieldValue('')
    }, [newWaypointFieldValue])
    const generatePdf = useCallback(async () => {
        dispatch({ type: 'CLEAR_ERROR' })

        const response = await fetch(apiPrefix + 'pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ waypoints: waypoints.map(w => w.address) }),
        })

        if (!response.ok) {
            dispatch({
                type: 'ERROR_OCCURED',
                error: new Error(`Failed to generate PDF (ERROR: '${await response.text()}')`),
            })
            return
        }

        saveAs(await response.blob(), 'waypoints.pdf')
    }, [waypoints])

    const shareWaypoints = useCallback(async () => {
        const searchParams = new URLSearchParams()
        searchParams.set('waypoints', JSON.stringify(waypoints.map(w => w.address)))

        try {
            await (navigator as INavigator).share({
                url: location.origin + location.pathname + '?' + searchParams.toString(),
            })
        } catch (e) {
            if (e instanceof Error && e.name !== 'AbortError') {
                dispatch({
                    type: 'ERROR_OCCURED',
                    error: new Error(`Share failed: ${e.message}`),
                })
            }
        }
    }, [waypoints])

    const isMobileDevice = isMobileFn().any

    const body = (
        <>
            {currentRouteInformation.status === 'FAILED' && (
                <div className="text text-danger" role="alert">
                    One or more waypoints could not be routed
                </div>
            )}
            {waypoints.length === 0 && (
                <div className="text text-secondary" role="alert">
                    Enter an address to begin
                </div>
            )}
            {waypoints.length === 1 && (
                <div className="text text-secondary" role="alert">
                    Enter another address to show route information
                </div>
            )}
            <WaypointList />
        </>
    )

    const footer = (
        <div id="waypoint-editor-footer-items">
            <div className="input-row">
                <input
                    type="text"
                    placeholder="New waypoint"
                    value={newWaypointFieldValue}
                    onChange={handleNewWaypointFieldChange}
                    onKeyPress={handleNewWaypointFieldKeyPress}
                    autoFocus={!isMobileDevice}
                />
                <button
                    title="Add waypoint"
                    onClick={addNewWaypoint}
                    onMouseDown={preventFocus}
                    disabled={!isValidAddress(newWaypointFieldValue)}
                    className="btn btn-primary"
                >
                    <i className="fas fa-fw fa-plus" />
                </button>
            </div>
            <button
                className="btn btn-primary"
                onClick={generatePdf}
                onMouseDown={preventFocus}
                disabled={waypoints.length === 0}
            >
                <i className={'fas fa-fw fa-' + (compactMode ? 'download' : 'file-pdf')} />
                {compactMode ? ' PDF' : ' Generate PDF'}
            </button>
            <button
                className="btn btn-primary"
                onClick={reverseWaypoints}
                onMouseDown={preventFocus}
                disabled={waypoints.length < 2}
            >
                <i className="fas fa-fw fa-exchange-alt" /> Reverse
            </button>
            {(navigator as INavigator).share && (
                <button
                    className="btn btn-primary"
                    onClick={shareWaypoints}
                    onMouseDown={preventFocus}
                    disabled={waypoints.length === 0}
                >
                    <i className="fas fa-fw fa-share" /> Share
                </button>
            )}
        </div>
    )

    return <WaypointEditorTemplate body={body} footer={footer} />
}