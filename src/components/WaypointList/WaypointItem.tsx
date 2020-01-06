import React, { useCallback, useContext } from 'react'
import { Draggable, DraggableProvided } from 'react-beautiful-dnd'
import { AppStateContext } from '../../context/AppStateContext'
import { useInputField } from '../../hooks/useInputField'
import { getRoute } from '../../redux/util'
import { isValidAddress } from '../../redux/validator'
import { preventFocus } from '../util/preventFocus'

type WaypointItemProps = {
    index: number;
    isBeingDraggedAlong: boolean;
}

export const WaypointItem = (props: WaypointItemProps) => {
    const { index, isBeingDraggedAlong } = props

    const {
        state: {
            waypoints: { list: waypoints, selected: selectedWaypoints },
            fetchedPlaces,
            fetchedRoutes,
        },
        dispatch,
    } = useContext(AppStateContext)
    const waypoint = waypoints[index]
    const waypointIsSelected = selectedWaypoints.has(waypoint.uuid)

    const {
        value: waypointFieldValue,
        setValue: setWaypointFieldValue,
        changeHandler: handleWaypointFieldValueChange,
        keyPressHandler: handleWaypointFieldKeyPress,
    } = useInputField(
        waypoint.address,
        () => fieldWasEdited && isValidAddress(waypointFieldValue) && setAddress(waypointFieldValue.trim()),
    )
    const fieldWasEdited = waypointFieldValue.trim() !== waypoint.address

    const setAddress = useCallback(newAddress => dispatch({ type: 'SET_ADDRESS', index, address: newAddress }), [
        index,
    ])
    const deleteWaypoint = useCallback(() => dispatch({ type: 'DELETE_WAYPOINT', index }), [index])
    const resetWaypointField = useCallback(() => setWaypointFieldValue(waypoint.address), [waypoint.address])
    const routeFetchResult = useCallback(
        (origin: string, destination: string) => getRoute(fetchedRoutes, origin, destination),
        [fetchedRoutes],
    )

    const placeFetchResult = fetchedPlaces.get(waypoint.address)

    const incomingRouteFetchResult =
        index !== 0 ? routeFetchResult(waypoints[index - 1].address, waypoints[index].address) : undefined

    const outgoingRouteFetchResult =
        index !== waypoints.length - 1
            ? routeFetchResult(waypoints[index].address, waypoints[index + 1].address)
            : undefined

    const itemWasClicked = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()

            if (e.shiftKey) {
                dispatch({ type: 'SELECT_WAYPOINT_RANGE', index })
            } else if (e.ctrlKey || e.metaKey) {
                dispatch({ type: 'TOGGLE_WAYPOINT_SELECTION', index })
            } else {
                dispatch({ type: 'SELECT_WAYPOINT', index })
            }
        },
        [index, dispatch],
    )

    const fetchIsInProgress =
        placeFetchResult?.status === 'IN_PROGRESS' ||
        incomingRouteFetchResult?.status === 'IN_PROGRESS' ||
        outgoingRouteFetchResult?.status === 'IN_PROGRESS'

    const fetchFailed =
        placeFetchResult?.status === 'FAILED' ||
        incomingRouteFetchResult?.status === 'FAILED' ||
        outgoingRouteFetchResult?.status === 'FAILED'

    const failureMessage =
        placeFetchResult?.status === 'FAILED'
            ? 'Could not find this waypoint'
            : incomingRouteFetchResult?.status === 'FAILED' && outgoingRouteFetchResult?.status === 'FAILED'
            ? 'Could not find route to or from this waypoint'
            : incomingRouteFetchResult?.status === 'FAILED'
            ? 'Could not find route from last waypoint'
            : outgoingRouteFetchResult?.status === 'FAILED'
            ? 'Could not find route to next waypoint'
            : undefined

    const failureIcon =
        placeFetchResult?.status === 'FAILED' ? (
            <i className="far fa-fw fa-dot-circle" />
        ) : incomingRouteFetchResult?.status === 'FAILED' && outgoingRouteFetchResult?.status === 'FAILED' ? (
            <i className="fas fa-fw fa-rotate-90 fa-exchange-alt" />
        ) : incomingRouteFetchResult?.status === 'FAILED' ? (
            <i className="fas fa-fw fa-long-arrow-alt-up" />
        ) : outgoingRouteFetchResult?.status === 'FAILED' ? (
            <i className="fas fa-fw fa-long-arrow-alt-down" />
        ) : null

    return (
        <Draggable index={index} draggableId={waypoint.uuid}>
            {(provided: DraggableProvided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={
                        'input-row' +
                        (waypointIsSelected ? ' waypoint-item-selected' : '') +
                        (isBeingDraggedAlong ? ' waypoint-item-dragging-along' : '')
                    }
                >
                    <button
                        title="Delete waypoint"
                        onClick={deleteWaypoint}
                        onMouseDown={preventFocus}
                        className="btn btn-danger"
                    >
                        <i className="fas fa-fw fa-trash-alt" />
                    </button>
                    <input
                        className="form-control"
                        value={waypointFieldValue}
                        onChange={handleWaypointFieldValueChange}
                        onKeyPress={handleWaypointFieldKeyPress}
                    />
                    {fieldWasEdited && (
                        <button onClick={resetWaypointField} onMouseDown={preventFocus} className="btn btn-secondary">
                            <i className="fas fa-fw fa-undo-alt" />
                        </button>
                    )}
                    <span>{index + 1}</span>
                    {fetchFailed && (
                        <span className="text-danger" title={failureMessage}>
                            {failureIcon}
                        </span>
                    )}
                    {fetchIsInProgress && (
                        <span className="text-secondary">
                            <i className="fas fa-fw fa-circle-notch fa-spin" />
                        </span>
                    )}
                    <span title="Drag to reorder" onClick={itemWasClicked} {...provided.dragHandleProps}>
                        <i className="fas fa-fw fa-grip-lines-vertical" />
                    </span>
                </div>
            )}
        </Draggable>
    )
}